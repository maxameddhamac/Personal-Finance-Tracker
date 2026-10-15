import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/apiClient";
import useAuthStore from "../store/authStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");

  // 1. Soo jiid Transactions
  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => (await api.get("/transactions")).data,
  });

  const transactions = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.transactions)
      ? rawData.transactions
      : [];

  // 2. Ku dar Transaction Mutation
  const addMutation = useMutation({
    mutationFn: async (newTx) => (await api.post("/transactions", newTx)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      setDescription("");
      setAmount("");
    },
  });

  // 3. Tirtir Transaction Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/transactions/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["transactions"]),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    addMutation.mutate({ description, amount: Number(amount), type });
  };

  // 4. Xisaabi Balance, Income, Expense
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Personal Finance Tracker
            </h1>
            <p className="text-sm text-gray-500">
              Soo dhawoow, {user?.name || "User"}! 👋
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                \${balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +\${totalIncome.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -\${totalExpense.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form & History */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Add Transaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tusaale: Mushahar..."
                    className="w-full mt-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Amount (\$)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    className="w-full mt-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    className="w-full mt-1 rounded-md border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="income">Income (Dakhli)</option>
                    <option value="expense">Expense (Kharash)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {addMutation.isPending ? "Darsaya..." : "Ku dar Transaction"}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* History */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-gray-500">Soo roganaya...</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Weli wax transaction ah lama diiwaangelin.
                </p>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {transactions.map((tx) => (
                    <div
                      key={tx._id || tx.id}
                      className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-white shadow-xs"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {tx.description}
                        </p>
                        <span className="text-xs text-gray-400">
                          {new Date(
                            tx.createdAt || Date.now(),
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-semibold text-sm ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {tx.type === "income" ? "+" : "-"}\$
                          {Number(tx.amount || 0).toFixed(2)}
                        </span>
                        <button
                          onClick={() => deleteMutation.mutate(tx._id || tx.id)}
                          className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
