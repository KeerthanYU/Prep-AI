const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://keerthanyu88_db_user:keerthan123@ac-zmgebrz-shard-00-00.x2eazlc.mongodb.net:27017,ac-zmgebrz-shard-00-01.x2eazlc.mongodb.net:27017,ac-zmgebrz-shard-00-02.x2eazlc.mongodb.net:27017/prepmate-ai?ssl=true&replicaSet=atlas-d4ajnx-shard-0&authSource=admin&retryWrites=true&w=majority')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

async function createUser() {
    try {
        const hashedPassword = await bcrypt.hash('123456', 12);

        const user = await User.create({
            email: "keerthan@gmail.com",
            password: hashedPassword,
            name: "Keerthan",
            role: "user"
        });

        console.log("User created successfully:", user.email);
    } catch (error) {
        console.log("Error creating user:", error.message);
    } finally {
        process.exit();
    }
}

createUser();