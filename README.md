# Projects App

Aplicación web de gestión de proyectos y tareas

## Descripción

En el contexto de la aplicación, el usuario es global, y este tiene el control de todas las operaciones en ella, por lo que se envían todas las notificaciones en general a una dirección de correo electronico configurada

## Datos técnicos

Este proyecto utiliza las siguientes herramientas:
- Nextjs
- Tailwindcss
- Aws Lambda
- AWS DynamoDB
- AWS SNS(Simple Notification Services)

## Autor 🖋️

Sergio Mercado Salazar

- [Linkedin](https://www.linkedin.com/in/devsergiom/)
- [Github](https://github.com/mercadosergio)

## Instalación

1. Clonar el repositorio
   `git clone https://github.com/mercadosergio/projects-app.git`

2. Una vez clonado el repositorio, cree un archivo llamado ``.env.local``, en el debe colocar las respectivas variables de entorno de los servicios a utilizar, como referencia tiene el archivo `.env.local.example`.

3. Abrir la consola de comandos y ubicarse en el directorio raiz del proyecto, allí ejecutar `npm install`.

4. Para lanzar la aplicación en ambiente de desarrollo ejecute en la consola `npm run dev` e interactue con las caracteristicas de la misma.

## Demo
Puede interactuar con la aplicación web ingresando a la [Demo](https://projects-appx.netlify.app/).