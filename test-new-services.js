import SearchService from "./shared/services/searchService.js";
import BrandService from "./shared/services/brandService.js";
import InventoryService from "./shared/services/inventoryService.js";
import NotificationService from "./shared/services/notificationService.js";

console.log("🔍 Testing all new services...
");

async function testNewServices() {
  // Test SearchService
  console.log("📍 Testing SearchService...");
  try {
    const searchResult = await SearchService.searchProducts("brake", {}, { limit: 3 });
    console.log("✅ SearchService.searchProducts:", searchResult.success);
    console.log("   - Found", searchResult.products?.length || 0, "products");

    const suggestionsResult = await SearchService.getSearchSuggestions("bra", 5);
    console.log("✅ SearchService.getSearchSuggestions:", suggestionsResult.success);
    console.log("   - Found", suggestionsResult.suggestions?.length || 0, "suggestions");

    const popularResult = await SearchService.getPopularSearches(3);
    console.log("✅ SearchService.getPopularSearches:", popularResult.success);
    console.log("   - Found", popularResult.popularSearches?.length || 0, "popular searches");
  } catch (error) {
    console.log("❌ SearchService failed:", error.message);
  }

  // Test BrandService
  console.log("
🏷️ Testing BrandService...");
  try {
    const brandsResult = await BrandService.getBrands({ limit: 3 });
    console.log("✅ BrandService.getBrands:", brandsResult.success);
    console.log("   - Found", brandsResult.brands?.length || 0, "brands");
  } catch (error) {
    console.log("❌ BrandService failed:", error.message);
  }

  // Test InventoryService
  console.log("
📊 Testing InventoryService...");
  try {
    const lowStockResult = await InventoryService.getLowStockProducts(null, 50);
    console.log("✅ InventoryService.getLowStockProducts:", lowStockResult.success);
    console.log("   - Found", lowStockResult.products?.length || 0, "low stock products");
  } catch (error) {
    console.log("❌ InventoryService failed:", error.message);
  }

  // Test NotificationService
  console.log("
🔔 Testing NotificationService...");
  try {
    const mockUserId = "test-user-123";
    
    const sendResult = await NotificationService.sendNotification(mockUserId, {
      title: "Test Notification",
      message: "This is a test notification",
      type: "info"
    });
    console.log("✅ NotificationService.sendNotification:", sendResult.success);

    const getResult = await NotificationService.getNotifications(mockUserId);
    console.log("✅ NotificationService.getNotifications:", getResult.success);
    console.log("   - Found", getResult.notifications?.length || 0, "notifications");

    const unreadResult = await NotificationService.getUnreadCount(mockUserId);
    console.log("✅ NotificationService.getUnreadCount:", unreadResult.success);
    console.log("   - Unread count:", unreadResult.unreadCount || 0);
  } catch (error) {
    console.log("❌ NotificationService failed:", error.message);
  }

  console.log("
🎉 All service tests completed!");
}

testNewServices();
