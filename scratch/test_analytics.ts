import { getDashboardData } from "../lib/actions/dashboard";

async function testAnalytics() {
  try {
    console.log("Fetching dashboard data...");
    const data = await getDashboardData();
    console.log("Dashboard Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

testAnalytics();
