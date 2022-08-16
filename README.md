# fishbiz-map

The repo contains the Vue project for the FishBiz Alaska fisheries map. This project can be run as a standalone Vue application for development, but is ultimately compiled into a static site that is pulled into a WordPress page via the Code Embed plugin.

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

After building the application, the contents of the `dist` directory need to be hosted somewhere. We are using an S3 bucket for this currently, but ideally in the future we will find a way to host the files within the WordPress website itself.

To push the files to our development S3 bucket from the AWS CLI:

```
aws s3 cp dist s3://wordpress-code-embed/ --acl public-read --recursive
```

### Incorporating into WordPress via Code Embed plugin

To incorporate the static files into a WordPress page via the Code Embed plugin, simply install the Code Embed plugin, create or edit a page, and add the following custom field:

Name:

`CODEMAP`

Value:

```
<div id="app"></div>
<script defer="defer" src="https://wordpress-code-embed.s3.us-west-2.amazonaws.com/app.js"></script>
<link href="https://wordpress-code-embed.s3.us-west-2.amazonaws.com/app.css" rel="stylesheet">
<script defer="defer" src="https://wordpress-code-embed.s3.us-west-2.amazonaws.com/chunk-vendors.js"></script>
```

Save and view the page, and the Alaska fisheries map should then load into the page.