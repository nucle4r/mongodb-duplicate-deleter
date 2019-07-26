const express = require('express');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'YOUR_MOBGO_URI';

// Database Name
const app = express();

app.get('/start', (req, res) => {
  res.send('in link');

  MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    let db = client.db('captions_db');

    db.collection('captions')
      .aggregate(
        [
          {
            $group: {
              _id: { content: '$content' },
              dups: { $addToSet: '$_id' },
              count: { $sum: 1 }
            }
          },
          {
            $match: {
              count: { $gt: 1 }
            }
          }
        ],
        { allowDiskUse: true } // For faster processing if set is larger
      )
      .forEach(function(doc) {
        doc.dups.shift();
        db.collection('captions').remove({
          _id: { $in: doc.dups }
        });
      });
  });
});

app.listen(2002, () => console.log('Server Started...'));
