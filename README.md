nodeHttpsAuthChat
=================

Example project for Nodejs chat service with Domain Forms Authentication via https

## Usage

First install required modules with
```bash
  npm install
```
NOTE: python 2 is required to install passport modules, including configuring PATH to python. Don't worry, if you don't have it, `npm install` will tell you what's missing.

Then, create an Active Directory user that will be used by the server to authenticate and search the ldap tree.
Configure `ldapConfig.json` as follows with your AD data:
```json
{
    "url":"ldap://server.domain.local/DC=domain,DC=local", 
    "base":"DC=domain,DC=local",
    "bindDN":"myADUser",
    "bindCredentials":"the_password_for_myADUser"
}
```

If you are just testing, you can leave the default certificates so just start `nodeAuthChat.js`, and that's all, the server will be listening https in port 443, so just hit it with a browser, you'll be warned about the self signed unsecure certificate, go on, log in with any AD user and pass, and chat.

NOTE: to login , use the username without the domain prefix. I mean `myUsername` is OK, there's no need to enter `myDomain\myUsername`.

If you'll be doing anything else, generate and change the certificates located at `/certs`. **If you use the default certificates anyone can se your passwords just by sniffing the network!!!.**

 
