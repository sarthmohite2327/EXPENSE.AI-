import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

function generateSuggestions(expenses: Expense[]): string[] {
  if (expenses.length === 0) {
    return [
      "Start tracking your expenses to get personalized savings tips",
      "Set a monthly budget to better manage your finances",
      "Consider using the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
    ];
  }

  const suggestions: string[] = [];

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  const totalSpending = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const percentage = ((topAmount / totalSpending) * 100).toFixed(0);
    suggestions.push(`${topCategory} accounts for ${percentage}% of your spending. Consider setting a specific budget for this category.`);
  }

  if (categoryTotals['Food']) {
    const foodPercentage = ((categoryTotals['Food'] / totalSpending) * 100);
    if (foodPercentage > 30) {
      suggestions.push("Your food expenses are high. Try meal prepping or cooking at home more often to save money.");
    }
  }

  if (categoryTotals['Entertainment']) {
    suggestions.push("Look for free or low-cost entertainment alternatives like parks, libraries, or community events.");
  }

  if (categoryTotals['Shopping']) {
    suggestions.push("Before making a purchase, wait 24 hours. This helps avoid impulse buying and saves money.");
  }

  const last7Days = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return expenseDate >= weekAgo;
  });

  if (last7Days.length > 10) {
    suggestions.push("You're making frequent transactions. Consider consolidating purchases to reduce spending opportunities.");
  }

  const avgTransaction = totalSpending / expenses.length;
  if (avgTransaction > 100) {
    suggestions.push("Your average transaction is high. Look for opportunities to buy in bulk or find discounts on big purchases.");
  }

  if (suggestions.length < 3) {
    suggestions.push("Track your spending for at least a month to identify patterns and areas to save.");
    suggestions.push("Consider the 24-hour rule for non-essential purchases over $50.");
    suggestions.push("Review your subscriptions and cancel ones you don't actively use.");
  }

  return suggestions.slice(0, 5);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      throw error;
    }

    const suggestions = generateSuggestions(expenses || []);

    return new Response(
      JSON.stringify({ suggestions }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, suggestions: [] }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
