# README para Proyecto IIC2173

## Consideraciones Generales
Se realizó el proyecto en un servidor EC2 de AWS, utilizando FastApi como framework para la api y Nginx como servidor web. Se utilizó certbot para obtener un certificado SSL y se configuró Nginx para redirigir el tráfico HTTP a HTTPS. Se utilizó Docker para correr la aplicación.

En cuanto a referencia de código externo, se utilizaron los links provistos en el enunciado del proyecto para la configuración, además de la documentación oficial del stack utilizado y recomendaciones de otros estudiantes en el canal de Slack sobre librerias y otras herramientas.

https://www.digitalocean.com/community/tutorials/how-to-configure-nginx-as-a-reverse-proxy-on-ubuntu-22-04
https://stackoverflow.com/questions/73482467/virtual-environment-for-fastapi
https://auth0.com/blog/build-and-secure-fastapi-server-with-auth0/


En cuanto al uso de inteligencia artificial, se utilizó Chat GPT para la instalacion de cerbot y nginx puesto que no resultó incicialmente la instalación de la ayudantía.

Por otra parte, dentro del repositorio, se utilizó Copilot para la generación de archivos de Dockerfile y compose.yaml, además del parseo de datos en database.py junto con el filtro para la api en main.py.

## Nombre del Dominio

```bash
iic2173.lavagnino.cl
ip: 18.116.175.145
```


## Método de Acceso al Servidor

Para acceder al servidor, se debe utilizar SSH. Las instrucciones específicas y las claves `.pem` no se incluyen aquí por motivos de seguridad, pero pueden ser proporcionadas de manera segura cuando sea necesario.

### Comandos de Acceso SSH

```bash
ssh -i "Keypair-E0VicenteLavagnino.pem" ubuntu@ec2-18-116-175-145.us-east-2.compute.amazonaws.com
```

### Puntos Logrados

En cuanto a los requisitos funcionales y no funcionales, se lograron todos los puntos de la parte mínima. En cuanto a los requisitos variables, se lograron todos los requisitos de la primera sección (HTTPS).
