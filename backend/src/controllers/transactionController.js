import Transaction from "../models/Transaction.js";

// 1. Add Transaction (Income or Expense)
export const addTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    const transaction = new Transaction({
      user: req.user.id, // Waxaa soo tabinaya protect middleware-ka
      title,
      amount,
      type,
      category,
      date: date || Date.now(),
      description,
    });

    const savedTransaction = await transaction.save();
    res.status(201).json({
      message: "Transaction added successfully",
      transaction: savedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get All Transactions for Logged-in User
export const getTransactions = async (req, res, next) => {
  try {
    // Ka soo saar user-ka oo u kala horraysii taariikhda cusub illaa duugga
    const transactions = await Transaction.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Delete Transaction
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Hubi in user-ku uu leeyahay transaction-kan
    if (transaction.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this transaction" });
    }

    await transaction.deleteOne();
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    next(error);
  }
};
