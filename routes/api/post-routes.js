const router = require('express').Router();
const { Post, User, Category, Comment } = require('../../models');
const sequelize = require('../../config/connection');

// get all users
// router.get('/', withAuth, (req, res) => {
router.get('/', (req, res) => {
  console.log('======================');
  Post.findAll({
    attributes: [
      'id',
      'image_url',
      'title',
      'created_at',
      [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
    ],
    order: [['created_at', 'DESC']],
    /* order property is assigned a nested array that orders by created_at column in descending order
    to display latest articles first */
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username']
        }
      },
      {
        model: User,
        attributes: ['username']
      },
      {
        model: Category,
        attributes: ['category_name']
      }
    ]
  })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// get-one query that will be used as a request parameter
// router.get('/:id', withAuth, (req, res) => {
router.get('/:id', (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['id', 'image_url', 'title', 'created_at',
      [
        sequelize.literal(
          '(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'
        ),
        'vote_count'
      ]
    ],
    include: [
      {
        model: User,
        attributes: ['username']
      }
    ]
  })
    .then(dbPostData => {
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }
      res.json(dbPostData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Create a Post
// router.post('/', withAuth, (req, res) => {
router.post('/', (req, res) => {
  // expects {title: 'Taskmaster goes public!', image_url: 'https://taskmaster.com/press', user_id: 1}
  Post.create({
    title: req.body.title,
    image_url: req.body.image_url,
    user_id: req.body.user_id,
    category_id: req.body.category_id
  })
    // .then((dbPostData) => {
    //   if (req.body.categoryIds.length) {
    //     const categoryIdArr = req.body.categoryIds.map((category_id) => {
    //       return {
    //         post_id: post.id,
    //         category_id,
    //       };
    //     })
    //     return Category.bulkCreate(categoryIdArr);
    //   }
    //   res.status(200).json(dbPostData);
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// PUT /api/posts/upvote
// router.put('/upvote', withAuth, (req, res) => {
// router.put('/upvote', (req, res) => {
//   // custom static method created in models/Post.js
//   // Post.upvote(req.body, { Vote })
//   //   .then(updatedPostData => res.json(updatedPostData))
//   //   .catch(err => {
//   //     console.log(err);
//   //     res.status(400).json(err);
//   //   });

//   // make sure the session exists first
//   if (req.session) {
//     // pass session id along with all destructured properties on req.body
//     Post.upvote({ ...req.body, user_id: req.session.user_id }, { Vote, Comment, User })
//       .then(updatedVoteData => res.json(updatedVoteData))
//       .catch(err => {
//         console.log(err);
//         res.status(500).json(err);
//       });
//   }
// });

// Update a post's title
// router.put('/:id', withAuth, (req, res) => {
router.put('/:id', (req, res) => {
  Post.update(
    {
      title: req.body.title
    },
    {
      where: {
        id: req.params.id
      }
    }
  )
    .then(dbPostData => {
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }
      res.json(dbPostData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Delete a Post
// router.delete('/:id', withAuth, (req, res) => {
router.delete('/:id', (req, res) => {
  Post.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(dbPostData => {
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }
      res.json(dbPostData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;