import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  ShoppingCart,
  Search,
  Package,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrderStore } from "@/store/useOrderStore";

export const Navbar = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalOrders = useOrderStore((state) =>
    state.getNotCompletedOrdersCount()
  );
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartShake, setCartShake] = useState(false);
  const [prevTotalItems, setPrevTotalItems] = useState(totalItems);
  const navigate = useNavigate();

  // Trigger shake animation when items added to cart
  useEffect(() => {
    if (totalItems > prevTotalItems) {
      setCartShake(true);
      setTimeout(() => setCartShake(false), 500);
    }
    setPrevTotalItems(totalItems);
  }, [totalItems]);

  // Sync search query with URL params
  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearchQuery(query);
  }, [searchParams]);

  const handleSignOut = () => {
    logout();
    toast.success("Đã đăng xuất");
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  // Check if current route matches
  const isOrdersRoute =
    location.pathname === "/orders" || location.pathname.startsWith("/order/");
  const isCartRoute =
    location.pathname === "/cart" || location.pathname === "/checkout";

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">ShopVN</span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/orders">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`relative ${
                        isOrdersRoute
                          ? "bg-accent hover:bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      <Package className="w-5 h-5" />
                      {totalOrders > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {totalOrders}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bạn có {totalOrders} đơn hàng cần theo dõi</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/cart">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`relative ${cartShake ? "cart-shake" : ""} ${
                        isCartRoute
                          ? "bg-accent hover:bg-accent text-accent-foreground"
                          : ""
                      }`}
                      data-cart-icon
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {totalItems > 0 && (
                        <Badge
                          className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs ${
                            cartShake ? "badge-bounce" : ""
                          }`}
                        >
                          {totalItems}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bạn có {totalItems} sản phẩm trong giỏ hàng</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled
                      className="text-muted-foreground"
                    >
                      {user?.username} ({user?.role})
                    </DropdownMenuItem>
                    {/* a divider */}
                    <hr className="my-1" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      style={{ cursor: "pointer" }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {user?.role === "admin" && (
                  <Link to="/admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 bg-accent hover:bg-red-500 text-accent-foreground"
                    >
                      <Shield className="h-5 w-5" />
                      <span className="hidden md:inline font-semibold text-sm">Admin Panel</span>
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Đăng nhập</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="pb-4 md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};
