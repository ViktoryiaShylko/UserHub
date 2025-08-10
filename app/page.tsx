'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorCard } from '@/components/ErrorCard';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
  };
  address: {
    street: string;
    city: string;
    zipcode: string;
  };
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [companyFilter, setCompanyFilter] = useState(searchParams.get('company') || 'all');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, 'id'> & { id?: number }>({
    name: '',
    username: '',
    email: '',
    phone: '',
    website: '',
    company: {
      name: ''
    },
    address: {
      street: '',
      city: '',
      zipcode: ''
    }
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (companyFilter !== 'all') params.set('company', companyFilter);
    
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [searchTerm, companyFilter, router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users. Status: ${response.status}`);
      }
      
      const apiUsers = await response.json();
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      const mergedUsers = [...apiUsers, ...localUsers].reduce((acc: User[], user: User) => {
        const existingIndex = acc.findIndex((u: User) => u.id === user.id);
        if (existingIndex === -1) {
          acc.push(user);
        } else if (localUsers.some((lu: User) => lu.id === user.id)) {
          acc[existingIndex] = user;
        }
        return acc;
      }, [] as User[]);
      
      setUsers(mergedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const handleStorageUpdate = () => {
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(prevUsers => prevUsers.map(user => {
        const updatedUser = localUsers.find((lu: User) => lu.id === user.id);
        return updatedUser || user;
      }));
    };

    window.addEventListener('localStorageUpdated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('localStorageUpdated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const companies = Array.from(new Set(
    users
      .map(user => user.company.name)
      .filter(name => name.trim() !== '')
  ));

  const filteredUsers = users.filter(user => {
    const matchesName = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = companyFilter === 'all' || user.company.name === companyFilter;
    return matchesName && matchesCompany;
  });

  const handleAddUser = () => {
    const newId = Math.max(...users.map(u => u.id), 0) + 1;
    const userToAdd = {
      ...newUser,
      id: newId,
      company: {
        name: newUser.company.name || 'Unknown Company'
      }
    };
    
    const updatedUsers = [...users, userToAdd];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    window.dispatchEvent(new Event('localStorageUpdated'));
    
    setNewUser({
      name: '',
      username: '',
      email: '',
      phone: '',
      website: '',
      company: { name: '' },
      address: { street: '', city: '', zipcode: '' }
    });
    setIsDialogOpen(false);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      window.dispatchEvent(new Event('localStorageUpdated'));
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <ErrorCard 
          title="Ошибка загрузки пользователей"
          message={error}
          onRetry={fetchUsers}
        />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full">
          <div className="w-full sm:flex-1">
            <Input
              type="text"
              placeholder="Search user by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="w-full sm:flex-1">
            <Select 
              onValueChange={setCompanyFilter} 
              value={companyFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="w-full sm:w-auto">
                Добавить пользователя
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Добавить нового пользователя</DialogTitle>
                <DialogDescription>
                  Заполните все поля формы
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {Object.entries({
                  name: 'Name',
                  username: 'Username',
                  email: 'Email',
                  phone: 'Phone',
                  website: 'Website',
                  company: 'Company'
                }).map(([key, label]) => (
                  <div key={key} className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor={key} className="sm:text-right">
                      {label}
                    </Label>
                    <Input
                      id={key}
                      type={key === 'email' ? 'email' : 'text'}
                      value={key === 'company' ? newUser.company.name : newUser[key as keyof typeof newUser]}
                      onChange={(e) => {
                        if (key === 'company') {
                          setNewUser({
                            ...newUser,
                            company: { name: e.target.value || 'Unknown Company' }
                          });
                        } else {
                          setNewUser({
                            ...newUser,
                            [key]: e.target.value
                          });
                        }
                      }}
                      className="col-span-3"
                      required
                    />
                  </div>
                ))}
              </div>
              
              <DialogFooter>
                <Button type="button" onClick={handleAddUser}>
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">{user.name}</CardTitle>
                  <CardDescription className="text-sm sm:text-base">{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm">Company: {user.company.name || 'Unknown Company'}</p>
                  <p className="text-sm">Phone: {user.phone}</p>
                  <p className="text-sm">Website: {user.website}</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Link href={`/user/${user.id}`} className="w-full sm:w-auto">
                    <Button className="w-full">View Profile</Button>
                  </Link>
                  <Button 
                    variant="outline"
                    onClick={() => handleDeleteUser(user.id)}
                    className="w-full sm:w-auto"
                  >
                    Delete Profile
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p>No users found</p>
            {(searchTerm || companyFilter !== 'all') && (
              <Button 
                variant="ghost" 
                className="mt-2"
                onClick={() => {
                  setSearchTerm('');
                  setCompanyFilter('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
