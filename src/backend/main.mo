import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Nat32 "mo:core/Nat32";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type ShopId = Nat32;
  type ProductId = Nat32;
  type OrderId = Nat32;
  type MessageId = Nat32;
  type OrderItemIndex = Nat32;

  var nextShopId : ShopId = 1;
  var nextProductId : ProductId = 1;
  var nextOrderId : OrderId = 1;
  var nextMessageId : MessageId = 1;

  module Currency {
    public func priceCompare(a : Float, b : Float) : Order.Order {
      Float.compare(b, a);
    };
  };

  type Shop = {
    id : ShopId;
    name : Text;
    distanceKm : Float;
    openTime : Text;
    closeTime : Text;
    isOpen : Bool;
    phone : Text;
    address : Text;
  };

  module Shop {
    public func compare(s1 : Shop, s2 : Shop) : Order.Order {
      Text.compare(s1.name, s2.name);
    };
  };

  type Product = {
    id : ProductId;
    shopId : ShopId;
    name : Text;
    category : Text;
    estimatedPrice : Float;
    isAvailable : Bool;
  };

  module Product {
    public func compareByPrice(p1 : Product, p2 : Product) : Order.Order {
      Float.compare(p1.estimatedPrice, p2.estimatedPrice);
    };

    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  type CartItem = {
    productId : ?ProductId;
    customItemName : ?Text;
    quantity : Nat;
    estimatedPrice : Float;
  };

  type OrderStatus = {
    #received;
    #checkingAvailability;
    #shoppingInProgress;
    #outForDelivery;
    #delivered;
    #rejected;
  };

  type Order = {
    id : OrderId;
    customerId : Principal;
    shopId : ShopId;
    items : [OrderItem];
    status : OrderStatus;
    estimatedTotal : Float;
    finalTotal : ?Float;
    deliveryFee : Float;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    adminNotes : Text;
  };

  type OrderItem = {
    itemName : Text;
    quantity : Nat;
    estimatedPrice : Float;
    confirmedPrice : ?Float;
    status : OrderItemStatus;
    alternativeSuggestion : Text;
  };

  type OrderItemStatus = {
    #pending;
    #confirmed;
    #unavailable;
    #substituted;
  };

  type SenderRole = {
    #customer;
    #admin;
  };

  type ChatMessage = {
    id : MessageId;
    orderId : OrderId;
    senderId : Principal;
    senderRole : SenderRole;
    message : Text;
    timestamp : Time.Time;
  };

  let shops = Map.empty<ShopId, Shop>();
  let products = Map.empty<ProductId, Product>();
  let orders = Map.empty<OrderId, Order>();
  let chatMessages = List.empty<ChatMessage>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func seedData() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };

    let shop1Id = nextShopId;
    let shop1 : Shop = {
      id = shop1Id;
      name = "Raja Kirana Store";
      distanceKm = 0.5;
      openTime = "7:00 AM";
      closeTime = "10:00 PM";
      isOpen = true;
      phone = "9876543210";
      address = "1, Main Market, Mumbai";
    };
    shops.add(shop1Id, shop1);
    nextShopId += 1;

    let shop2Id = nextShopId;
    let shop2 : Shop = {
      id = shop2Id;
      name = "Sharma General Store";
      distanceKm = 1.2;
      openTime = "8:00 AM";
      closeTime = "9:00 PM";
      isOpen = false;
      phone = "9123456780";
      address = "22, Station Road, Thane";
    };
    shops.add(shop2Id, shop2);
    nextShopId += 1;

    let product1Id = nextProductId;
    let product1 : Product = {
      id = product1Id;
      shopId = shop1.id;
      name = "Bread (400g)";
      category = "Bakery";
      estimatedPrice = 30.0;
      isAvailable = true;
    };
    products.add(product1Id, product1);
    nextProductId += 1;

    let product2Id = nextProductId;
    let product2 : Product = {
      id = product2Id;
      shopId = shop1.id;
      name = "Parle-G Biscuits";
      category = "Snacks";
      estimatedPrice = 10.0;
      isAvailable = true;
    };
    products.add(product2Id, product2);
    nextProductId += 1;

    let product3Id = nextProductId;
    let product3 : Product = {
      id = product3Id;
      shopId = shop2.id;
      name = "Amul Taaza (500ml)";
      category = "Dairy";
      estimatedPrice = 27.0;
      isAvailable = false;
    };
    products.add(product3Id, product3);
    nextProductId += 1;

    let product4Id = nextProductId;
    let product4 : Product = {
      id = product4Id;
      shopId = shop2.id;
      name = "Cadbury Dairy Milk (50g)";
      category = "Chocolate";
      estimatedPrice = 50.0;
      isAvailable = true;
    };
    products.add(product4Id, product4);
    nextProductId += 1;

    let product5Id = nextProductId;
    let product5 : Product = {
      id = product5Id;
      shopId = shop1.id;
      name = "Patanjali Dant Kanti (100g)";
      category = "Toiletries";
      estimatedPrice = 45.0;
      isAvailable = true;
    };
    products.add(product5Id, product5);
    nextProductId += 1;
  };

  public query ({ caller }) func getShops() : async [Shop] {
    shops.values().toArray().sort();
  };

  public query ({ caller }) func getProductsByShop(shopId : ShopId) : async [Product] {
    products.values().toArray().filter(func(p) { p.shopId == shopId }).sort();
  };

  public query ({ caller }) func getProductsByShopSortedByPrice(shopId : ShopId) : async [Product] {
    products.values().toArray().filter(func(p) { p.shopId == shopId }).sort(Product.compareByPrice);
  };

  public shared ({ caller }) func createOrder(shopId : ShopId, items : [CartItem]) : async OrderId {
    let shop = switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (?shop) { shop };
    };

    let orderItems = List.empty<OrderItem>();
    var estimatedTotal = 0.0;

    for (item in items.values()) {
      if (item.productId != null and item.customItemName == null) {
        let productId = switch (item.productId) {
          case (null) { Runtime.trap("Invalid item: productId should not be null") };
          case (?id) { id };
        };
        let product = switch (products.get(productId)) {
          case (null) { Runtime.trap("Product not found") };
          case (?product) { product };
        };
        let orderItem : OrderItem = {
          itemName = product.name;
          quantity = item.quantity;
          estimatedPrice = product.estimatedPrice;
          confirmedPrice = null;
          status = #pending;
          alternativeSuggestion = "";
        };
        orderItems.add(orderItem);
        estimatedTotal += product.estimatedPrice * item.quantity.toFloat();
      } else if (item.productId == null and item.customItemName != null) {
        let customItemName = switch (item.customItemName) {
          case (null) { Runtime.trap("Invalid item: customItemName should not be null") };
          case (?name) { name };
        };
        let orderItem : OrderItem = {
          itemName = customItemName;
          quantity = item.quantity;
          estimatedPrice = item.estimatedPrice;
          confirmedPrice = null;
          status = #pending;
          alternativeSuggestion = "";
        };
        orderItems.add(orderItem);
        estimatedTotal += item.estimatedPrice * item.quantity.toFloat();
      } else {
        Runtime.trap("Invalid item: Either productId or customItemName must be provided");
      };
    };

    let orderId = nextOrderId;
    nextOrderId += 1;

    let order : Order = {
      id = orderId;
      customerId = caller;
      shopId;
      items = orderItems.toArray();
      status = #received;
      estimatedTotal;
      finalTotal = null;
      deliveryFee = 30.0;
      createdAt = Time.now();
      updatedAt = Time.now();
      adminNotes = "";
    };

    orders.add(orderId, order);
    orderId;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    orders.values().toArray().filter(func(o) { o.customerId == caller });
  };

  public query ({ caller }) func getOrderById(orderId : OrderId) : async ?Order {
    let order = switch (orders.get(orderId)) {
      case (null) { return null };
      case (?order) { order };
    };

    if (order.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    ?order;
  };

  public shared ({ caller }) func sendChatMessage(orderId : OrderId, message : Text) : async () {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    if (order.customerId != caller) {
      Runtime.trap("Unauthorized: only order owner can send chat messages");
    };

    let messageId = nextMessageId;
    nextMessageId += 1;

    let chatMessage : ChatMessage = {
      id = messageId;
      orderId;
      senderId = caller;
      senderRole = #customer;
      message;
      timestamp = Time.now();
    };

    chatMessages.add(chatMessage);
  };

  public query ({ caller }) func getOrderChat(orderId : OrderId) : async [ChatMessage] {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    if (order.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view chat for your own orders");
    };

    chatMessages.toArray().filter(func(m) { m.orderId == orderId });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : OrderStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let updatedOrder : Order = {
      id = order.id;
      customerId = order.customerId;
      shopId = order.shopId;
      items = order.items;
      status;
      estimatedTotal = order.estimatedTotal;
      finalTotal = order.finalTotal;
      deliveryFee = order.deliveryFee;
      createdAt = order.createdAt;
      updatedAt = Time.now();
      adminNotes = order.adminNotes;
    };

    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func confirmOrderItem(orderId : OrderId, itemIndex : OrderItemIndex, confirmedPrice : Float) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can confirm order items");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let items = order.items;

    if (itemIndex.toNat() >= items.size()) {
      Runtime.trap("Order item not found");
    };

    let updatedItems = items.enumerate().map(func((index, item)) { if (index == itemIndex.toNat()) { { item with confirmedPrice = ?confirmedPrice; status = #confirmed } } else { item } }).toArray();
    let updatedOrder : Order = {
      id = order.id;
      customerId = order.customerId;
      shopId = order.shopId;
      items = updatedItems;
      status = order.status;
      estimatedTotal = order.estimatedTotal;
      finalTotal = order.finalTotal;
      deliveryFee = order.deliveryFee;
      createdAt = order.createdAt;
      updatedAt = Time.now();
      adminNotes = order.adminNotes;
    };

    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func rejectOrderItem(orderId : OrderId, itemIndex : OrderItemIndex, alternativeSuggestion : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can reject order items");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let items = order.items;

    if (itemIndex.toNat() >= items.size()) {
      Runtime.trap("Order item not found");
    };

    let updatedItems = items.enumerate().map(func((index, item)) { if (index == itemIndex.toNat()) { { item with confirmedPrice = null; status = #unavailable; alternativeSuggestion } } else { item } }).toArray();
    let updatedOrder : Order = {
      id = order.id;
      customerId = order.customerId;
      shopId = order.shopId;
      items = updatedItems;
      status = order.status;
      estimatedTotal = order.estimatedTotal;
      finalTotal = order.finalTotal;
      deliveryFee = order.deliveryFee;
      createdAt = order.createdAt;
      updatedAt = Time.now();
      adminNotes = order.adminNotes;
    };

    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func confirmOrder(orderId : OrderId, finalTotal : Float) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can confirm orders");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let updatedOrder : Order = {
      id = order.id;
      customerId = order.customerId;
      shopId = order.shopId;
      items = order.items;
      status = #shoppingInProgress;
      estimatedTotal = order.estimatedTotal;
      finalTotal = ?finalTotal;
      deliveryFee = order.deliveryFee;
      createdAt = order.createdAt;
      updatedAt = Time.now();
      adminNotes = order.adminNotes;
    };

    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func rejectOrder(orderId : OrderId, reason : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can reject orders");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let updatedOrder : Order = {
      id = order.id;
      customerId = order.customerId;
      shopId = order.shopId;
      items = order.items;
      status = #rejected;
      estimatedTotal = order.estimatedTotal;
      finalTotal = order.finalTotal;
      deliveryFee = order.deliveryFee;
      createdAt = order.createdAt;
      updatedAt = Time.now();
      adminNotes = reason;
    };

    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func sendAdminChatMessage(orderId : OrderId, message : Text) : async () {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can send chat messages");
    };

    let messageId = nextMessageId;
    nextMessageId += 1;

    let chatMessage : ChatMessage = {
      id = messageId;
      orderId;
      senderId = caller;
      senderRole = #admin;
      message;
      timestamp = Time.now();
    };

    chatMessages.add(chatMessage);
  };

  public shared ({ caller }) func editOrderItemPrice(orderId : OrderId, itemIndex : OrderItemIndex, newPrice : Float) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can change prices");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let items = order.items;

    if (itemIndex.toNat() >= items.size()) {
      Runtime.trap("Order item not found");
    };

    let updatedItems = items.enumerate().map(func((index, item)) { if (index == itemIndex.toNat()) { { item with estimatedPrice = newPrice } } else { item } }).toArray();
    let updatedOrder : Order = {
      id = order.id;
      customerId = order.customerId;
      shopId = order.shopId;
      items = updatedItems;
      status = order.status;
      estimatedTotal = order.estimatedTotal;
      finalTotal = order.finalTotal;
      deliveryFee = order.deliveryFee;
      createdAt = order.createdAt;
      updatedAt = Time.now();
      adminNotes = order.adminNotes;
    };

    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func updateShopStatus(shopId : ShopId, isOpen : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can change shop status");
    };

    let shop = switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (?shop) { shop };
    };

    let updatedShop : Shop = {
      id = shop.id;
      name = shop.name;
      distanceKm = shop.distanceKm;
      openTime = shop.openTime;
      closeTime = shop.closeTime;
      isOpen;
      phone = shop.phone;
      address = shop.address;
    };

    shops.add(shopId, updatedShop);
  };

  public shared ({ caller }) func addShop(
    name : Text,
    distanceKm : Float,
    openTime : Text,
    closeTime : Text,
    phone : Text,
    address : Text,
  ) : async ShopId {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add shops");
    };

    let shopId = nextShopId;
    nextShopId += 1;

    let shop : Shop = {
      id = shopId;
      name;
      distanceKm;
      openTime;
      closeTime;
      isOpen = true;
      phone;
      address;
    };

    shops.add(shopId, shop);
    shopId;
  };

  public shared ({ caller }) func addProduct(shopId : ShopId, name : Text, category : Text, estimatedPrice : Float) : async ProductId {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let shop = switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (?shop) { shop };
    };

    let productId = nextProductId;
    nextProductId += 1;

    let product : Product = {
      id = productId;
      shopId;
      name;
      category;
      estimatedPrice;
      isAvailable = true;
    };

    products.add(productId, product);
    productId;
  };

  public query ({ caller }) func getProductById(productId : ProductId) : async ?Product {
    products.get(productId);
  };

  public query ({ caller }) func getShopById(shopId : ShopId) : async ?Shop {
    shops.get(shopId);
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p) { Text.equal(p.category, category) }).sort();
  };
};
