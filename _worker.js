addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Set preferred addresses, without port it defaults to 8443, does not support non-TLS subscription generation
let addresses = [
  'www.visa.com:2096',
  'icook.tw:2053',
  'cloudflare.com'
];

// Set preferred addresses API interface
let addressesapi = [
  'https://raw.githubusercontent.com/jev121/sub4worker/main/addressesapi.txt' // Refer to the content format for self-building.
];

let DLS = 4;
let addressescsv = [
  'https://raw.githubusercontent.com/jev121/sub4worker/main/addressescsv.csv'
];

let subconverter = "api.v1.mk"; // Online subscription conversion backend, currently using Fei Yang's subscription conversion function. Supports self-built psub, you can build it yourself: https://github.com/bulianglin/psub
let subconfig = "https://raw.githubusercontent.com/jev121/sub4worker/main/Clash/config/ACL4SSR_Online_Full_MultiMode.ini"; // Subscription configuration file

async function getAddressesapi() {
  if (!addressesapi || addressesapi.length === 0) {
    return [];
  }

  let newAddressesapi = [];

  for (const apiUrl of addressesapi) {
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error('Error fetching addresses:', response.status, response.statusText);
        continue;
      }

      const text = await response.text();
      const lines = text.split('\n');
      const regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(#.*)?$/;

      const apiAddresses = lines.map(line => {
        const match = line.match(regex);
        return match ? match[0] : null;
      }).filter(Boolean);

      newAddressesapi = newAddressesapi.concat(apiAddresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      continue;
    }
  }

  return newAddressesapi;
}

async function getAddressescsv() {
  if (!addressescsv || addressescsv.length === 0) {
    return [];
  }

  let newAddressescsv = [];

  for (const csvUrl of addressescsv) {
    try {
      const response = await fetch(csvUrl);

      if (!response.ok) {
        console.error('Error fetching CSV addresses:', response.status, response.statusText);
        continue;
      }

      const text = await response.text();  // Parse text content with the correct character encoding
      const lines = text.split('\n');

      // Check if the CSV header contains the required fields
      const header = lines[0].split(',');
      const tlsIndex = header.indexOf('TLS');
      const speedIndex = header.length - 1; // Last field

      const ipAddressIndex = 0;  // IP address position in CSV header
      const portIndex = 1;  // Port position in CSV header
      const dataCenterIndex = tlsIndex + 1; // Data center is the field after TLS

      if (tlsIndex === -1) {
        console.error('CSV file is missing required fields');
        continue;
      }

      // Iterate over CSV rows starting from the second row
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');

        // Check if TLS is "TRUE" and speed is greater than DLS
        if (columns[tlsIndex].toUpperCase() === 'TRUE' && parseFloat(columns[speedIndex]) > DLS) {
          const ipAddress = columns[ipAddressIndex];
          const port = columns[portIndex];
          const dataCenter = columns[dataCenterIndex];

          const formattedAddress = `${ipAddress}:${port}#${dataCenter}`;
          newAddressescsv.push(formattedAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching CSV addresses:', error);
      continue;
    }
  }

  return newAddressescsv;
}

let protocol;
async function handleRequest(request) {
  const userAgentHeader = request.headers.get('User-Agent');
  const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
  const url = new URL(request.url);
  let host = "";
  let uuid = "";
  let path = "";

  if (url.pathname.includes("/auto") || url.pathname.includes("/404") || url.pathname.includes("/sos")) {
    host = "jev121xxxx.pages.dev";
    uuid = "bbcd8891-bae1-7968-b127-f17f9c249527";
    path = "/?ed=2048";

	} else if (url.pathname.includes("/lunzi")) {
		let sites = [
			{ url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/xray/config.json',type: "xray"},
			{ url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/xray/1/config.json',type: "xray" },
			{ url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/xray/2/config.json',type: "xray"},
			{ url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/xray/3/config.json',type: "xray"},
			{ url: 'https://gitlab.com/free9999/ipupdate/-/raw/master/xray/config.json',type: "xray"},
			{ url: 'https://gitlab.com/free9999/ipupdate/-/raw/master/xray/2/config.json',type: "xray"},
		];

		const maxRetries = 6;
		let retryCount = 0;
		let data = null;

		while (retryCount < maxRetries) {
		  const randomSite = sites[Math.floor(Math.random() * sites.length)];
		  const response = await fetch(randomSite.url);

			if (response.ok) {
				data = await response.json();
				if (!data) {
					console.error('Failed to fetch data after multiple retries.');
					// Here you can choose how to handle failure, such as returning an error response or executing other logic
					return new Response('Failed to fetch data after multiple retries.', {
					status: 500,
					headers: { 'content-type': 'text/plain; charset=utf-8' },
					});
				}
			
				processXray(data);
			
				function processXray(data) {
					let outboundConfig = data.outbounds[0];
					host = outboundConfig?.streamSettings?.wsSettings?.headers?.Host;
					uuid = outboundConfig.settings?.vnext?.[0]?.users?.[0]?.id;
					path = outboundConfig?.streamSettings?.wsSettings?.path;
					protocol = outboundConfig.protocol;
				}

				if (protocol.toLowerCase() === 'vless') {
					break; // Exit the loop when data is successfully obtained
				}
			} else {
				console.error('Failed to fetch data. Retrying...');
				retryCount++;
			}
		}

	} else {
		host = url.searchParams.get('host');
		uuid = url.searchParams.get('uuid');
		path = url.searchParams.get('path');
		
		if (!url.pathname.includes("/sub")) {
			const workerUrl = url.origin + url.pathname;
			const responseText = `
		路径必须包含 "/sub"
		The path must contain "/sub"
		مسیر باید شامل "/sub" باشد
		
		${workerUrl}sub?host=[your host]&uuid=[your uuid]&path=[your path]
		
		
		
		
		
		
			
			https://github.com/jev121/sub4worker
			`;
		
			return new Response(responseText, {
			  status: 400,
			  headers: { 'content-type': 'text/plain; charset=utf-8' },
			});
		  }
		
		  if (!host || !uuid) {
			const workerUrl = url.origin + url.pathname;
			const responseText = `
		缺少必填参数：host 和 uuid
		Missing required parameters: host and uuid
		پارامترهای ضروری وارد نشده: هاست و یوآی‌دی
		
		${workerUrl}?host=[your host]&uuid=[your uuid]&path=[your path]
		
		
		
		
		
		
			
			https://github.com/jev121/sub4worker
			`;
		
			return new Response(responseText, {
			  status: 400,
			  headers: { 'content-type': 'text/plain; charset=utf-8' },
			});
		  }
		
		  if (!path || path.trim() === '') {
			path = encodeURIComponent('/?ed=2048');
		  } else {
			// If the first character is not a slash, add a slash at the beginning
			path = (path[0] === '/') ? encodeURIComponent(path) : encodeURIComponent('/' + path);
		  }
	}
  
	if (userAgent.includes('clash')) {
		const subconverterUrl = `https://${subconverter}/sub?target=clash&url=${encodeURIComponent(request.url)}&insert=false&config=${encodeURIComponent(subconfig)}&emoji=true&list=false&tfo=false&scv=false&fdn=false&sort=false&new_name=true`;

		try {
		  const subconverterResponse = await fetch(subconverterUrl);
	  
		  if (!subconverterResponse.ok) {
			throw new Error(`Error fetching subconverterUrl: ${subconverterResponse.status} ${subconverterResponse.statusText}`);
		  }
	  
		  const subconverterContent = await subconverterResponse.text();
	  
		  return new Response(subconverterContent, {
			headers: { 'content-type': 'text/plain; charset=utf-8' },
		  });
		} catch (error) {
		  return new Response(`Error: ${error.message}`, {
			status: 500,
			headers: { 'content-type': 'text/plain; charset=utf-8' },
		  });
		}
	} else if (userAgent.includes('sing-box') || userAgent.includes('singbox')){
		const subconverterUrl = `https://${subconverter}/sub?target=singbox&url=${encodeURIComponent(request.url)}&insert=false&config=${encodeURIComponent(subconfig)}&emoji=true&list=false&tfo=false&scv=false&fdn=false&sort=false&new_name=true`;

		try {
		  const subconverterResponse = await fetch(subconverterUrl);
	  
		  if (!subconverterResponse.ok) {
			throw new Error(`Error fetching subconverterUrl: ${subconverterResponse.status} ${subconverterResponse.statusText}`);
		  }
	  
		  const subconverterContent = await subconverterResponse.text();
	  
		  return new Response(subconverterContent, {
			headers: { 'content-type': 'text/plain; charset=utf-8' },
		  });
		} catch (error) {
		  return new Response(`Error: ${error.message}`, {
			status: 500,
			headers: { 'content-type': 'text/plain; charset=utf-8' },
		  });
		}
	} else {
		const newAddressesapi = await getAddressesapi();
		const newAddressescsv = await getAddressescsv();
		addresses = addresses.concat(newAddressesapi);
		addresses = addresses.concat(newAddressescsv);
	
	  // Use a Set object to remove duplicates
	  const uniqueAddresses = [...new Set(addresses)];
	
	  const responseBody = uniqueAddresses.map(address => {
		let port = "8443";
		let addressid = address;
	
		if (address.includes(':') && address.includes('#')) {
		  const parts = address.split(':');
		  address = parts[0];
		  const subParts = parts[1].split('#');
		  port = subParts[0];
		  addressid = subParts[1];
		} else if (address.includes(':')) {
		  const parts = address.split(':');
		  address = parts[0];
		  port = parts[1];
		} else if (address.includes('#')) {
		  const parts = address.split('#');
		  address = parts[0];
		  addressid = parts[1];
		}
	
		if (addressid.includes(':')) {
		  addressid = addressid.split(':')[0];
		}
	
		const vlessLink = `vless://${uuid}@${address}:${port}?encryption=none&security=tls&sni=${host}&fp=random&type=ws&host=${host}&path=${path}#${encodeURIComponent(addressid)}`;
	
		return vlessLink;
	  }).join('\n');
	
	  const base64Response = btoa(responseBody);
	
	  const response = new Response(base64Response, {
		headers: { 'content-type': 'text/plain' },
	  });
	
	  return response;
	}

	
  }
