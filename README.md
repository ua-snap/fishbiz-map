# fishbiz-map

The repo contains the Vue project for the FishBiz Alaska fisheries map. This project can be run as a standalone Vue application for development, but is ultimately compiled into a static site that is pulled into a WordPress page via a Beaver Builder HTML block.

## Installing dependencies

```
npm install
```

### Running as a standalone application

```
npm run serve
```

### Building static files

```
npm run build
```

### Hosting static files

After building the application, the contents of the `dist` directory need to be hosted in an S3 bucket. To push the static files to the production fishbiz-map S3 bucket from the AWS CLI, run the following:

```
aws s3 cp dist s3://fishbiz-map/ --acl public-read --recursive
```

### Incorporating into WordPress via Beaver Builder

To incorporate the static files into a WordPress page via Beaver Builder, simply use Beaver Builder's HTML module to create an HTML block on the page where the app should appear. Set the content of the HTML block to:

```
<div id="app"></div>
<script defer="defer" src="https://fishbiz-map.s3.us-west-2.amazonaws.com/app.js"></script>
<script defer="defer" src="https://fishbiz-map.s3.us-west-2.amazonaws.com/chunk-vendors.js"></script>
<link href="https://fishbiz-map.s3.us-west-2.amazonaws.com/app.css" rel="stylesheet">
<link href="https://fishbiz-map.s3.us-west-2.amazonaws.com/chunk-vendors.css" rel="stylesheet">
```

The height of the app can be changed from its default height by setting inline CSS on the app div, like this:

```
<div id="app" style="height: 600px;"></div>
```