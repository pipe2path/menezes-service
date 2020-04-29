# menezes-service
Services to be exposed for my projects

## About
The service acts as an backend API service that exposes endpoints to retrieve Item Lists, post requests and images. The service is implemented in Node v12.13.0.

## How it works
This application is only a barebones Node.js application using Express.js. There are 2 routes served as endpoints, 1) Items 2) Upload.

###### /items
The /items route has a GET and POST method. The GET method retrieves items from the MySQL database and returns JSON e.g.
{ "itemId": 21, "name": "Hand Sanitizer", "brand": "Purell"}.
The POST method returns subscriber name and phone number in the payload, inserts these into the database. It also looks for any publishers who have submitted
a snapshot of a store aisle containg the item requested. If an item is found, a SMS text message is crafted and sent to the subscriber using the Twilio SMS API.

###### /upload
The /upload route has a POST method. The method receives a payload with the publisher's (shopper at a store) name, store location and image. The
database is queried for a match between the item submitted and requested. The requesters of the items are then sent an SMS message with the item details
and location.

## How to use it
The service is typically used from a client app, either a browser or a REST client application i.e. Postman.

## Setup
- [Nodejs v12.13.0](http://nodejs.org)
- [A Twilio account] - (https://www.twilio.com/try-twilio)
- [AWS S3 account] - (https://portal.aws.amazon.com/billing/signup)

A MySQL database needs to be created. Table details are as follows:
1. ```CREATE TABLE `image` (
  `orderId` int(11) NOT NULL AUTO_INCREMENT,
  `itemId` int(11) DEFAULT NULL,
  `submittedBy` varchar(45) DEFAULT NULL,
  `store` varchar(45) DEFAULT NULL,
  `notes` varchar(300) DEFAULT NULL,
  `submitDate` datetime DEFAULT NULL,
  `image` varchar(120) DEFAULT NULL,
  `latitude` varchar(45) DEFAULT NULL,
  `longitude` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`orderId`)
) AUTO_INCREMENT=115 DEFAULT CHARSET=utf8;```

2. ```CREATE TABLE `item` (
  `itemId` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `brand` varchar(45) DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`itemId`)
) AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;```

3. ```CREATE TABLE `request` (
  `requestId` int(11) NOT NULL AUTO_INCREMENT,
  `customerName` varchar(45) DEFAULT NULL,
  `phoneNumber` varchar(45) DEFAULT NULL,
  `itemId` int(11) DEFAULT NULL,
  `dateRequested` datetime DEFAULT NULL,
  PRIMARY KEY (`requestId`)
) AUTO_INCREMENT=94 DEFAULT CHARSET=utf8;```


4. ```CREATE TABLE `transmission` (
  `transmissionId` int(11) NOT NULL AUTO_INCREMENT,
  `requestId` int(11) DEFAULT NULL,
  `dateSent` datetime DEFAULT NULL,
  `orderId` int(11) DEFAULT NULL,
  PRIMARY KEY (`transmissionId`)
) AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;```

## Local development

After the abvoe requirements have been met:

1. Clone this repository and `cd` into it

```
https://github.com/pipe2path/menezes-service.git
cd menezes-service
```

2. Install dependencies

```
npm install
```

3. Set your environment variables
```
npm run setup
```

4. Run the application
```
npm start
```

5. Navigate to [http://localhost:3050](http://localhost:3050)

## Cloud deployment
You can deploy this application to variety of host services. I have used Heroku which offers a great mix of deployment options and additional resources
for Database, Cloud storage etc.

[Heroku](https://www.heroku.com/)

## License
[MIT](http://www.opensource.org/licenses/mit-license.html)

