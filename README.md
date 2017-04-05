# How to Build Real-Time Digital Displays Using Couchbase Secure Microservices

## Run Instructions:

1. Download Sync Gateway from <a href="http://www.couchbase.com/nosql-databases/downloads" target="_blank">http://www.couchbase.com/nosql-databases/downloads</a>
2. Copy the sync_gateway executable from the download package to this directory
3. Open default.html from this directory
4. Start Sync Gateway
  1. Open a terminal window
  2. 'cd' to this directory
  3. Run './sync_gateway sync-gateway-config.json'
5. Run demo
  1. Open a terminal window
  2. 'cd' to this directory
  3. Run './demo'
  4. Follow on-screen instructions

## Re-Run Instructions:

1. Kill Sync Gateway (ctrl+c in the Sync Gateway terminal window)
2. Execute the 'Start Sync Gateway' steps from above
3. Execute the 'Run demo' steps from above

## Notes:

* Retrieving data for a specific gate is done by passing the query parameters ‘airport’ and ‘gate’ to default.html. If present, the parameters are passed as a filter to Sync Gateway. e.g. …/default.html?airport=sfo&gate=a17
