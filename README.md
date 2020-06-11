Notice 
===========


Lancer le serveur
-----

Se rendre dans le dossier api
```
cd application7/src/api
```
Lancer le serveur
```
npm start
```

Lancer l'application sur navigateur
----

Se rendre dans le dossier client
```
cd application7/src/client
```
Lancer le client
```
npm start
```

Lancer l'application sur émulateur android/téléphone en mode débug
----

Se rendre dans le dossier client
```
cd application7/src/client
```

Créer les fichiers pour compilation cordova, se rendre dans le dossier créé, et lancer la compilation
```
node ./build/build.js
cd cordova
cordova build
```
lancer sur un émulateur android ou un téléphone android connecté
```
cordova run android
```
*Note: pour le lancer sur un téléphone android il faudra changer l'adresse du serveur pour y mettre l'IP du serveur dans un réseau en commun avec le téléphone:* **application7/src/client/www/js/app.js ligne 36** 
