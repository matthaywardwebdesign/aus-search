<img src="http://i.imgur.com/uSkO4oN.png" width="250px" />

# AusSearch
A collection of Node JS scripts to create both a MongoDB Database and an Elasticsearch index of all Australian addresses
using open data provided by [https://data.gov.au](https://data.gov.au/dataset/geocoded-national-address-file-g-naf)

## Requirements
To run the provided scripts you will need to have a few things installed on your machine
- Docker
- Node JS with ES6 support

## Getting started
1. **Start up MongoDB and Elasticsearch**

   Run the following command
   ```
   docker-compose up
   ```
   Running this will pull the Docker images for MongoDB and Elasticsearch and start instances of them both.
2. **Install the required NodeJS packages**
   
   Run the following command
   ```
   npm install
   ```
   Running this will install the NodeJS packages used by our scripts
3. **Downloading the G-NAF data**

   Run the following command
   ```
   ./download.sh
   ```
   Running this will pull down a copy of the G-NAF data from the http://data.gov.au website and unzip the resulting zip file into the `data` directory.
4. **Import the data into MongoDB**
   
   Run the following command
   ```
   node import.js
   ```
   Running this will parse the data files downloaded and insert them into collections in MongoDB.
5. **Create indexes in MongoDB**
   
   To make the following steps as quick as possible run the following command
   ```
   node create-indexes.js
   ```
   Running this will create indexes in the MongoDB Database that will make reading data a lot faster in the following steps.
6. **Simplify the data**

   Run the following command
   ```
   node simplify.js
   ```
   Running this combine and simplify the data imported in step 4
7. **Create Elasticsearch index**

   Run the following command
   ```
   node elasticsearch-create.js
   ```
   Running this will create the Elasticsearch index that we can insert our documents into.
 8. **Indexing our data with Elasticsearch**
 
    Run the following command
    ```
    node elasticsearch-import.js
    ```
    Running this will import our data into Elasticsearch.

## Searching data
Once all of the steps above have been run it's time to search our data. Searching for an address is as easy as making a GET request to the following URL:
```
http://localhost:9200/address/singleAddress/_search?q=ADDRESS_GOES_HERE
```
If all is successful you should receive a list of matching addresses.

## References
*Incorporates or developed using G-NAF ©PSMA Australia Limited licensed by the Commonwealth of Australia under the Open Geo-coded National Address File (G-NAF) End User Licence Agreement.*
