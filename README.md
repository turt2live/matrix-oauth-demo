# matrix-oauth-demo
A demo webservice for https://github.com/turt2live/matrix-oauth

## Running

The best deployment option is Docker:

```shell script
# Create the directory for mounting to the container
mkdir -p /etc/matrix-oauth-demo/config

# Create/edit the configuration file with your favourite editor. Use
# the default.yaml config file in this repo as a template.
vi /etc/matrix-oauth-demo/config/production.yaml

# Run the container
docker run -v /etc/matrix-oauth-demo:/data -p 8080:8080 turt2live/matrix-oauth-demo
```

Note that you'll need to set up your own reverse proxy for handling SSL. The Docker command above
might not be perfect for your environment, but it covers the part where it has a port to expose and
a volume to mount.
