# Spotify Control CLI
Um controle remoto para spotify, em linha de comando. Também possui um bot da twitch integrado para ler comandos do chat e executar uma ação no Spotify.

## Como usar
Se for a primeira vez utilizando:
- Execute o comando `npm run init`
- Preencha os campos `SPOTIFY_CLIENT_ID` e `SPOTIFY_CLIENT_SECRET` (Podem ser adquiridos no [Spotify Developer Console]((https://developer.spotify.com/console/))) no arquivo `.env`
- Caso queira utilizar o modo Bot da Twitch, preencha também os campos `TWITCH_USERNAME`, `TWITCH_OAUTH` (Pode ser adquirido [aqui](https://twitchapps.com/tmi/)) e `TWITCH_CHANNEL`
- Para executar o modo controle remoto: `npm start`
- Para executar o modo de Bot da Twitch: `npm run start:twitch`
    - <strong>Comandos disponíveis:</strong>
        - !proxima
        - !anterior
        - !musica <musica - artista>


![Screenshot da aplicação, contém o título e o menu principal](screenshot.png "Screenshot da aplicação")
## Roadmap
- [x] ~~Criar sistema para salvar o token/refresh token em cache~~
- [x] ~~Implementar refresh token~~
- [x] ~~Refatorar boa parte do código~~
- [x] ~~Melhorar interface do console~~
- [x] ~~Criar bot na twitch pra trocar de música~~
- [x] ~~Implementar modo de busca de música rápida~~
- [ ] Deixar comandos da twitch parametrizáveis

## Roadmap pra quando eu estiver com vontade
- [ ] Criar testes unitários (Jest)
- [ ] Colocar num container
