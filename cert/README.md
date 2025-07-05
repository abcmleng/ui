# SSL Certificate Generation Instructions

To enable HTTPS for local development and allow camera access from your phone, you need to generate a self-signed SSL certificate.

Run the following commands in your terminal from the project root:

```bash
mkdir -p cert
openssl req -x509 -newkey rsa:4096 -nodes -keyout cert/key.pem -out cert/cert.pem -days 365 -subj "/CN=localhost"
```

This will create the following files:
- cert/key.pem (private key)
- cert/cert.pem (certificate)

Make sure to trust the certificate on your phone if prompted.

After generating the certificate, run the dev server with HTTPS enabled (already configured in vite.config.ts).

Access the app from your phone using:
https://192.168.1.45:3000

Note: Replace 192.168.1.45 with your computer's local network IP address.
