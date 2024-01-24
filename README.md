# sub4worker
### This is a subscription generator that combines Cloudflare Workers - VLESS with a self-hosted preferred domain.
The Cloudflare Workers script generates VLESS subscription links based on specified preferences and additional dynamic addresses. It provides a convenient way to set up a VLESS subscription with preferred addresses and supports fetching additional addresses from an API.

## Usage
To use this Cloudflare Workers script, follow these steps:

Deploy the [worker.js](https://github.com/jev121/sub4worker/blob/main/_worker.js) script on your Cloudflare account.
Configure your VLESS client to use the generated subscription link.

## Parameters
The script supports the following parameters:

**host**: Your VLESS server hostname.

**uuid**: Your VLESS client UUID.

**path** (optional): The WS path for your VLESS (can be left empty).

## Path Requirement
The path must include "/sub". For example:

```lua
https://[YOUR-WORKER-URL]/sub?host=[YOUR-HOST]&uuid=[YOUR-UUID]&path=[YOUR-PATH]
```
Replace placeholders with your actual values, such as **YOUR-WORKER-URL**, **YOUR-HOST**, and **YOUR-UUID**. **YOUR-PATH** can be left empty. Additionally, consider adding more details or customizations based on your specific use case.

### Setting Up Your Exclusive Preferred Domain
Modify and add the **addresses** parameter. If no port is provided, it defaults to 8443. Non-TLS subscriptions are not supported. The # symbol after the address is for adding alias comments.
```js
let addresses = [
	'www.visa.com:2096',
	'icook.tw:2053',
	'cloudflare.com'
];
```

### Fetching Additional Preferred Addresses
The script allows fetching additional addresses from an API. Set the addressesapi variable in the script to the URL of the Preferred Addresses API.
```js
let addressesapi = [
  'https://raw.githubusercontent.com/jev121/sub4woker/main/addressesapi.txt' // This API is just an example and not maintained. Set up your own based on the content format.
];
```

## Example
### Request:
```lua
https://sub.xxxx.com/sub?host=www.google.com&uuid=bbcd8891-bae1-7968-b127-f17f9c249527&path=ws
```

### Response:
The response will be a Base64-encoded VLESS subscription link:

```makefile
dmxlc3M6Ly95b3VyLWhvc3Q9eXlvdXIuaG9zdDpkb2N0OjQ0My9lZG=...
```

## License

Distributed under the MIT license.

## Sponsor
We are proudly sponsored by DartNode.  DartNode supports our project by providing [mention the specific support they offer, such as infrastructure, services, etc.].
websize:https://dartnode.com

[![DartNode Logo](https://app.dartnode.com/assets/dash/images/brand/favicon.png)](https://dartnode.com)

Please consider supporting DartNode as they are not only supporting us but also contributing to the open-source community.
