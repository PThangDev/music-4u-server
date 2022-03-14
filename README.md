# \*\*RESTful API nodejs with expressJs

\*\* URL: [https://music-app-v2-server.herokuapp.com/api/v2](https://music-app-v2-server.herokuapp.com/api/v2)

## Link Web: [Music4u](https://music4u.vercel.app/)

## API

### `Song`

- GET
  - Get all songs: URL/songs
  - Get songs by params : URL/songs?params
    `EX: URL/songs?limit=4&page=2sort=name`
  - Get song by id: URL/songs/:id
  - Get songs by album slug: URL/songs/album/:albumSlug
  - Get songs by category slug: URL/songs/category/:categorySlug
- POST
  - Create song: URL/songs
- PUT
  - Update song by id: URL/songs/:songId
- DELETE
  - Delete song by id: URL/songs/:songId

### `Category`

- GET

  - Get all categories: URL/categories
  - Get categories by params : URL/categories?params
    `EX: URL/categories?limit=4&page=2sort=name`
  - Get category by id: URL/categories/:categoryId

### `Singer`

- GET

  - Get all singers: URL/singers
  - Get singers by params: URL/singers?params
    `EX: URL/singers?limit=4&page=2sort=name`
  - Get singer by slug: URL/singers/:singerSlug

### `Album`

- GET

  - Get all albums: URL/albums
  - Get albums by params : URL/albums?params
    `EX: URL/albums?limit=4&page=2sort=name`
  - Get album by id: URL/albums/:albumId
  - Get albums by category slug: URL/albums/album/category/:categorySlug
  - Get all albums of album groups: URL/albums/album/album_groups
  - Get albums by album group slug: URL/albums/album/album_groups/:albumGroupSlug

### `AUTH`

- POST
  - Login: URL/auths/login
  - Register: URL/auths/register
- PUT
  - Update info user: URL/auths/update/:userId

### `Search`

- GET
  - Search: URL/search?keyword=...
