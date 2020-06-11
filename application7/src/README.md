Notice 
===========


Lancer le serveur
-----

Se rendre dans le dossier api
```
cd api
```
Lancer le serveur
```
npm start
```

Lancer l'application sur navigateur
----

Se rendre dans le dossier client
```
cd client
```
Lancer le client
```
npm start
```

Lancer l'application sur émulateur android/téléphone en mode débug
----

Se rendre dans le dossier client
```
cd client
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