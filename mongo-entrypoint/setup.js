let db = connect('mongodb://admin:123456@localhost:27017/admin')
db = db.getSiblingDB('lego')
db.createUser({
  user: 'xiaoli',
  pwd: '123456',
  roles: [{ roles: 'readWrite', db: 'lego' }]
})

db.createCollection('works')

db.works.insertOne({
  id: 19,
  title: '1024 程序员日'
})
