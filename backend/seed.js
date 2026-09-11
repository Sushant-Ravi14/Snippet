const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

const FAKE_HASH = '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; 

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create Dummy Users
    const usersData = [
      {
        username: 'tech_guru',
        email: 'guru@tech.com',
        passwordHash: FAKE_HASH,
        bio: 'I love technology and coding!',
        avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=guru',
      },
      {
        username: 'travel_bug',
        email: 'travel@bug.com',
        passwordHash: FAKE_HASH,
        bio: 'Exploring the world one city at a time.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=travel',
      },
      {
        username: 'foodie_forever',
        email: 'foodie@forever.com',
        passwordHash: FAKE_HASH,
        bio: 'Pizza, pasta, and everything in between.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=foodie',
      }
    ];

    console.log('Creating users...');
    const users = await User.insertMany(usersData);

    // Make them follow each other
    users[0].following.push(users[1]._id, users[2]._id);
    users[1].followers.push(users[0]._id);
    users[2].followers.push(users[0]._id);

    users[1].following.push(users[0]._id);
    users[0].followers.push(users[1]._id);

    await users[0].save();
    await users[1].save();
    await users[2].save();

    // Create Posts
    const postsData = [
      {
        author: users[0]._id,
        text: 'Just finished setting up a new Node.js backend. Express and MongoDB are such a great combo! 🚀💻',
        likes: [users[1]._id, users[2]._id],
      },
      {
        author: users[1]._id,
        text: 'The sunset at the beach today was absolutely breathtaking. I wish I could stay here forever. 🌅🏖️',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        location: { locality: 'Malibu, CA', latitude: 34.0259, longitude: -118.7798 },
        likes: [users[0]._id],
      },
      {
        author: users[2]._id,
        text: 'Tried making homemade pasta for the first time! It was a bit messy but tasted amazing. 🍝🤤',
        image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80',
        likes: [users[0]._id, users[1]._id],
      },
      {
        author: users[0]._id,
        text: 'What is everyone\'s favorite programming language right now? I\'m really getting into Rust.',
      },
      {
        author: users[1]._id,
        text: 'Packing my bags for my next adventure! Can anyone guess where I am heading next? ✈️🌍',
      }
    ];

    console.log('Creating posts...');
    const posts = await Post.insertMany(postsData);

    // Create some comments
    console.log('Creating comments...');
    await Comment.create([
      {
        post: posts[0]._id,
        author: users[1]._id,
        text: 'Totally agree! It is my go-to stack.',
      },
      {
        post: posts[1]._id,
        author: users[2]._id,
        text: 'That looks stunning! Enjoy your trip.',
      }
    ]);

    console.log('Dummy data inserted successfully!');
    process.exit();
  } catch (error) {
    console.error('Error inserting data:', error);
    process.exit(1);
  }
};

seedData();
