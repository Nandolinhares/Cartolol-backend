const { db } = require('../util/admin');

exports.getAllPosts = (req, res) => {
    db.collection('posts').get()
        .then((data) => {
            let posts = [];
            data.forEach((doc) => {
                posts.push({
                    postId: doc.id,
                    name: doc.data().name,
                    age: doc.data().age
                });
            })
            return res.json(posts);
        })
        .catch(err => {
            return console.error(err);
        })
}