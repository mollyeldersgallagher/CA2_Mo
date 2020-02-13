/**
 * @Date:   2020-02-03T10:14:00+00:00
 * @Last modified time: 2020-02-11T18:03:31+00:00
 */



const router = require('express').Router();
const multer = require('multer');
const uuidv4 = require('uuid/v4');
const passport = require('passport');
const settings = require('../config/passport')(passport);

const getToken = (headers) => {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

//cb = callback fucnction
//uuidv4is a Universally unique identifier
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './');
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName)
    }
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

let Author = require('../models/Author');


router.route('/').get((req, res) => {
  Author.find()
    .then(authors => res.json(authors))
    .catch(err => res.status(400).json('Error: ' + err));

   // res.json(authors);
});


router.route("/:id").get((req, res) => {

  const authorId = req.params.id;

  Author.findById(authorId)
    .then(result => {
      if (!result) {
        return res.status(404).json({
          message: "author not found with id " + authorId
        });
      }
      res.json(result);
    })
    .catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).json({
          message: "author not found with id " + authorId
        });
      }
      return res.status(500).json({
        message: "Error retrieving author with id " + authorId
      });
    });

});

router.route("/").post(passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  const token = getToken(req.headers);
  const author = req.body;
  //validate author
  if (token) {
    if (!author.isbn) {
      return res.status(400).json({
        message: "author isbn can not be empty"
      });
    }
    if (!author.title) {
      return res.status(400).json({
        message: "author title can not be empty"
      });
    }


    const newAuthor = new Author(author);
    console.log(newAuthor);
    newAuthor.save()
      .then(data => {
        res.json(data);
      })
      .catch(err => res.status(400).json('Error: ' + err));

  } else {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized.'
    });
  }
});

router.route("/:id").put(passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const token = getToken(req.headers);
  const authorId = req.params.id;
  const newAuthor = req.body;
  if (token) {
    if (!newAuthor.title) {
      return res.status(400).json({
        message: "Author title can not be empty"
      });
    }

    // Find Author and update it with the request body
    Author.findByIdAndUpdate(authorId, newAuthor, {
        new: true
      })
      .then(author => {
        if (!author) {
          return res.status(404).json({
            message: "author not found with id " + authorId
          });
        }
        res.json(author);
      }).catch(err => {
        if (err.kind === 'ObjectId') {
          return res.status(404).json({
            message: "author not found with id " + authorId
          });
        }
        return res.status(500).json({
          message: "Error updating author with id " + authorId
        });
      });
  } else {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized'
    });
  }
});

router.route("/:id").delete(passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const token = getToken(req.headers);
  const authorId = req.params.id;
  if (token) {
    Author.findByIdAndRemove(authorId)
      .then(author => {
        if (!author) {
          return res.status(404).json({
            message: "author not found with id " + authorId
          });
        }
        res.json({
          message: "author deleted successfully!"
        });
      }).catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'NotFound') {
          return res.status(404).json({
            message: "author not found with id " + authorId
          });
        }
        return res.status(500).send({
          message: "Could not delete author with id " + authorId
        });
      });
  } else {
    return res.status(403).json({
      success: false,
      messsage: 'Unuthorized'
    });
  }
});


module.exports = router;
