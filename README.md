  
<p align="center"><img src="http://dl.snapserv.net/syncio.png" /></p>

# sync.io #
sync.io is a open-source **BitTorrent Sync** tracker server, which is meant for internal use within companies. A open-source relay server is under development and will follow soon. A special gimmick is the inbuilt web status page where you can see all announced shares and their peers.

## License ##
GPL version 3. Please take a look into LICENE if you want to know more.

## Prerequisites ##
To run sync.io, you should have the following applications installed and configured:

- Node.js v0.8.x or higher
- npm (Node package manager)

## Installation ##
Installing sync.io really easy. Just open a terminal window and enter the following commands:

```
git clone https://github.com/NeoXiD/sync.io.git
cd sync.io
npm install
```

That's it. You should be now able to run your own BitTorrent Sync tracker. You should take a look into **config.json** and see if there is anything you would like to change before running the application though.

## Usage ##
Before you can use your own tracker server with BitTorrent Sync, you will obviously need to start sync.io. Once again, open a terminal window and enter the following commands:

```
cd where/ever/it/is/sync.io
npm start
```

To ensure that your server continues to run when an error should occur, take a look at solutions like [forever](https://github.com/nodejitsu/forever). Now there is one last, but **very important** step: BitTorrent Sync does not officially support own trackers and relay servers, for what so ever reason. There are various ways to use your own server:

1) Create a DNS record at your company's DNS server for this domain which points at your own server: **t.usyncapp.com**.

2) Make some fancy firewall rules to redirect traffic which is meant for **t.usyncapp.com** to your own tracker server.

3) Edit your hosts file and add an appropriate entry. (I've had some problems with that on Linux, be careful!)

4) Run your own DNS server somewhere and override the domain with your own DNS record, as mentioned under point one.

This application was mainly designed for my workplace. We've just added a DNS record there which overrides the *real* domain, so BitTorrent Sync works over our own internal sync server. But why so complicated, BT Sync supports LANs? Unfortunately, the inbuilt LAN discovery is not an option for companies, because no one routes broadcasts over different subnets...

## Web status page ##
Hey, stop! Didn't you say something about an inbuilt web status page? Yes, just open your browser and head over to: *http://yourtracker:4000* - Ofcourse, if you've changed the port within the configuration file, you will need to adjust the port. Screenshot? Sure, here we go:

<p align="center"><img src="http://dl.snapserv.net/syncio-screen1.png" /></p>
<p align="center"><img src="http://dl.snapserv.net/syncio-screen2.png" /></p>

## Need help? ##
Do you need any help? Do you have any suggestions or some feedback? Feel free to contact me by [mail](mailto:dev@snapserv.net).