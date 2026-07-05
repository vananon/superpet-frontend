# Documentación de la Capa de Presentación (Frontend)

## Proyecto Pawvlog – Trabajo Final del Curso de Sistemas Operativos

El presente repositorio contiene la implementación de la **capa de presentación** del sistema **Pawvlog**, desarrollada como parte del trabajo final del curso de Sistemas Operativos. El proyecto representa la aplicación práctica de diversos conceptos relacionados con arquitecturas distribuidas, comunicación entre servicios, consumo de APIs, programación asíncrona y separación de responsabilidades dentro de una aplicación moderna. Asimismo, permitió adquirir experiencia en el despliegue de aplicaciones utilizando **Docker** y la administración de **máquinas virtuales** en **Microsoft Azure** con **Ubuntu Linux** 

A lo largo del desarrollo se aplicó una arquitectura orientada a servicios, donde el Frontend actúa como cliente encargado de interactuar con servicios externos mediante peticiones HTTP (GET, PUT, DELETE, POST), desacoplando la lógica de presentación, la lógica de la capa de aplicación y del almacenamiento de datos.

El objetivo principal de esta documentación es describir las decisiones de diseño adoptadas, la integración entre componentes y los conocimientos implementados durante el desarrollo del proyecto.

---

# Arquitectura del Sistema (Modelo de Tres Capas)

El sistema fue construido siguiendo una arquitectura de tres capas, permitiendo distribuir las responsabilidades de cada componente.

## 1. Capa de Presentación (Frontend)

Corresponde al contenido de este repositorio y fue desarrollada utilizando **HTML, CSS y JavaScript Vanilla**.

Entre las principales características de la capa, se encuentra:

* Gestionar la interacción entre el usuario y el sistema.
* Realizar peticiones HTTP asíncronas mediante la API `fetch`.
* Procesar las respuestas recibidas por los servicios.

## 2. Capa de Aplicación (Backend)

Implementada mediante una API REST, esta capa centraliza el procesamiento de toda la lógica del sistema.

Entre las principales características de la capa, se encuentra:
* Validación y autenticación de usuarios mediante JWT.
* Uso de Node.js
* Validación de la información recibida.
* Comunicación con la base de datos.
* Exposición de endpoints consumidos por el Frontend.

## 3. Capa de Base de Datos

Responsable del almacenamiento permanente de la información del sistema en una base de datos No Relacional, MongoDB.

Se encuentra dividida en dos componentes:

* **Base de datos**, encargada de almacenar las colecciones de usuarios, publicaciones, comentarios e interacciones.
* **Cloudinary**, utilizado como servicio externo para el almacenamiento y procesamiento de imágenes.

Esta separación permite reducir la carga del servidor principal y delegar el manejo de archivos multimedia a un servicio especializado.

---

# Integración y Consumo de APIs

Uno de los principales conocimientos aplicados durante el desarrollo del proyecto fue la integración entre aplicaciones mediante APIs REST.

La comunicación entre el Frontend y los diferentes servicios se realiza utilizando peticiones HTTP asíncronas mediante la API `fetch`, permitiendo mantener una interfaz dinámica sin necesidad de recargar la página.

## Consumo de la API REST del Backend

El Frontend consume múltiples endpoints expuestos por el servidor para realizar las operaciones principales del sistema.

Toda la lógica de negocio permanece encapsulada en el Backend, mientras que el Frontend únicamente envía solicitudes, procesa las respuestas y actualiza la interfaz correspondiente.

---

## Integración con Cloudinary

Como parte del desarrollo también se implementó el consumo de una API externa, integrando el servicio de **Cloudinary** para el almacenamiento de imágenes.

El flujo implementado consiste en:

1. Capturar el archivo seleccionado por el usuario.
2. Construir un objeto `FormData`.
3. Enviar una petición HTTP `POST` al endpoint público de Cloudinary.
4. Obtener la dirección `secure_url` generada por el servicio.
5. Enviar dicha URL al Backend para asociarla con la publicación o el perfil correspondiente.

---

# Referencia de Endpoints del Backend

La siguiente tabla presenta los endpoints implementados por el servicio [**superpet-api**](https://github.com/vananon/superpet-api), los cuales conforman la interfaz de comunicación entre la capa de presentación y la lógica de negocio del sistema. Cada endpoint expone una funcionalidad específica mediante el protocolo HTTP, permitiendo realizar operaciones sobre usuarios, publicaciones, comentarios e interacciones.

| Método HTTP | Endpoint                   | Descripción                                                                                                         |
| :---------- | :------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| **POST**    | `/users/register`          | Registra un nuevo usuario, almacena sus credenciales de forma segura y devuelve un token JWT para la autenticación. |
| **POST**    | `/users/login`             | Autentica las credenciales de un usuario y genera un token JWT válido para la sesión.                               |
| **GET**     | `/users/check`             | Verifica la disponibilidad de un nombre de usuario antes de su registro.                                            |
| **GET**     | `/users/search`            | Realiza búsquedas de usuarios según diferentes criterios.                                                           |
| **GET**     | `/users`                   | Obtiene el listado completo de usuarios registrados.                                                                |
| **GET**     | `/users/:id`               | Recupera la información correspondiente a un usuario específico.                                                    |
| **PUT**     | `/users/:id`               | Actualiza la información general de un usuario.                                                                     |
| **DELETE**  | `/users/:id`               | Elimina permanentemente un usuario del sistema.                                                                     |
| **GET**     | `/users/:id/notifications` | Obtiene el historial de notificaciones e interacciones recibidas por un usuario.                                    |
| **POST**    | `/users/:id/pets`          | Registra una nueva mascota asociada al perfil del usuario.                                                          |
| **PUT**     | `/users/:id/pets/:petId`   | Actualiza la información de una mascota registrada.                                                                 |
| **DELETE**  | `/users/:id/pets/:petId`   | Elimina una mascota del perfil del usuario.                                                                         |
| **GET**     | `/posts`                   | Recupera el conjunto de publicaciones disponibles en el sistema.                                                    |
| **POST**    | `/posts`                   | Crea una nueva publicación.                                                                                         |
| **GET**     | `/posts/:id`               | Obtiene la información de una publicación específica.                                                               |
| **PUT**     | `/posts/:id`               | Modifica el contenido de una publicación existente.                                                                 |
| **DELETE**  | `/posts/:id`               | Elimina una publicación.                                                                                            |
| **GET**     | `/posts/:postId/comments`  | Recupera los comentarios asociados a una publicación.                                                               |
| **POST**    | `/comments`                | Registra un nuevo comentario sobre una publicación.                                                                 |
| **GET**     | `/comments`                | Obtiene el listado general de comentarios almacenados.                                                              |
| **GET**     | `/comments/:id`            | Recupera la información de un comentario específico.                                                                |
| **PUT**     | `/comments/:id`            | Actualiza el contenido de un comentario.                                                                            |
| **DELETE**  | `/comments/:id`            | Elimina un comentario del sistema.                                                                                  |
| **POST**    | `/interactions`            | Registra una interacción entre usuarios, como un "Me gusta" o un "Seguir".                                          |
| **GET**     | `/interactions`            | Obtiene el listado de interacciones registradas.                                                                    |
| **GET**     | `/interactions/:id`        | Recupera la información de una interacción específica.                                                              |
| **DELETE**  | `/interactions/:id`        | Elimina una interacción previamente registrada.                                                                     |


# Conocimientos Aplicados

El desarrollo de esta capa de presentación permitió poner en práctica diversos conceptos estudiados durante el curso y en otras asignaturas relacionadas con el desarrollo de software, entre ellos:

* Arquitectura de software basada en tres capas.
* Consumo e integración de APIs REST.
* Uso de contenedores (Docker)
* Programación asíncrona mediante `fetch` y Promesas.
* Intercambio de información utilizando el protocolo HTTP.
* Separación de responsabilidades entre presentación, lógica de negocio y persistencia.
* Creación de máquinas virtuales en Microsoft Azure
* Comunicación entre sistemas desacoplados mediante interfaces definidas.

En conclusión, el proyecto evidencia la aplicación de estos conceptos dentro de una implementación funcional.
