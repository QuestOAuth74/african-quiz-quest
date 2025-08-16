import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Crown, Clock, Activity, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDisplayName } from "@/lib/username-generator";

interface UserProfile {
  user_id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
  player_status: string;
  last_seen: string | null;
  created_at: string;
}

const UserManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"created_at" | "last_seen" | "display_name">("last_seen");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, sortBy, sortOrder]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, email, display_name, is_admin, player_status, last_seen, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const displayName = getDisplayName(user.display_name, user.user_id, user.email);
        return (
          displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "display_name":
          aValue = getDisplayName(a.display_name, a.user_id, a.email);
          bValue = getDisplayName(b.display_name, b.user_id, b.email);
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "last_seen":
          aValue = a.last_seen ? new Date(a.last_seen).getTime() : 0;
          bValue = b.last_seen ? new Date(b.last_seen).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredUsers(filtered);
  };

  const isRecentlyActive = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Date(lastSeen) > oneHourAgo;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "waiting":
        return "bg-yellow-500";
      case "in_game":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <Card className="jeopardy-card">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="jeopardy-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Monitor and manage registered users and their activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleSort("display_name")}
                  >
                    User {sortBy === "display_name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("created_at")}
                  >
                    Joined {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("last_seen")}
                  >
                    Last Seen {sortBy === "last_seen" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isRecentlyActive(user.last_seen) && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Active in past hour" />
                        )}
                        <span className="font-medium">
                          {getDisplayName(user.display_name, user.user_id, user.email)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(user.player_status || "offline")}`} />
                        <span className="capitalize text-sm">
                          {user.player_status || "offline"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <Crown className="h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        {isRecentlyActive(user.last_seen) && (
                          <Activity className="h-3 w-3 text-green-500" />
                        )}
                        {formatDate(user.last_seen)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No users found matching your search." : "No users found."}
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManager;