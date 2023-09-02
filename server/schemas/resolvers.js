const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      return await User.findById(context.user._id).populate('savedBooks');
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) throw new Error("Can't find this user");

      if (!(await user.isCorrectPassword(password))) throw new Error('Wrong password!');
      return { token: signToken(user), user };
    },

    addUser: async (_, args) => {
      const user = await User.create(args);
      return { token: signToken(user), user };
    },

    saveBook: async (_, { input }, context) => {
      return await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: input } },
        { new: true, runValidators: true }
      ).populate('savedBooks');
    },

    removeBook: async (_, { bookId }, context) => {
      return await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      ).populate('savedBooks');
    },
  },
};

module.exports = resolvers;
