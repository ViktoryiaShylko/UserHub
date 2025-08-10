'use client';

import { useState, useEffect, use } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    city: string;
    zipcode: string;
  };
  phone: string;
  website: string;
  company: {
    name: string;
  };
}

export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const localUser = localUsers.find((u: User) => u.id === Number(id));
        
        if (localUser) {
          setUser(localUser);
          setEditedUser(JSON.parse(JSON.stringify(localUser)));
          return;
        }

        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setUser(data);
        setEditedUser(JSON.parse(JSON.stringify(data)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSave = async () => {
    if (!editedUser) return;
    
    try {
      const usersFromStorage = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = usersFromStorage.filter((u: User) => u.id !== editedUser.id);
      updatedUsers.push(editedUser);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUser(editedUser);
      setIsEditModalOpen(false);
      window.dispatchEvent(new Event('localStorageUpdated'));
      alert('Изменения успешно сохранены!');
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      alert('Произошла ошибка при сохранении изменений');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
        <Link href="/" className="ml-0 sm:ml-4 mt-2 sm:mt-0 inline-block">
          <Button variant="outline">На главную</Button>
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 sm:p-8 text-center">
        <p>Пользователь не найден</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">На главную</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="mb-4 sm:mb-6">
        <Button variant="outline" onClick={() => router.back()}>← Назад</Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{user.name}</h1>
        
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h2 className="font-semibold text-gray-500 text-sm sm:text-base">Username</h2>
            <p className="mt-1 text-sm sm:text-base">{user.username}</p>
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-500 text-sm sm:text-base">Email</h2>
            <p className="mt-1 text-sm sm:text-base">{user.email}</p>
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-500 text-sm sm:text-base">Address</h2>
            <p className="mt-1 text-sm sm:text-base">
              {user.address.street}, {user.address.city}, {user.address.zipcode}
            </p>
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-500 text-sm sm:text-base">Phone</h2>
            <p className="mt-1 text-sm sm:text-base">{user.phone}</p>
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-500 text-sm sm:text-base">Website</h2>
            <p className="mt-1 text-sm sm:text-base">{user.website}</p>
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-500 text-sm sm:text-base">Company</h2>
            <p className="mt-1 text-sm sm:text-base">{user.company.name}</p>
          </div>
        </div>

        <div className="flex justify-end mt-6 sm:mt-8">
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Редактировать</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Редактировать пользователя</DialogTitle>
                <DialogDescription>
                  Внесите изменения в данные пользователя
                </DialogDescription>
              </DialogHeader>
              
              {editedUser && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="sm:text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="sm:text-right">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={editedUser.username}
                      onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="sm:text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="street" className="sm:text-right">
                      Street
                    </Label>
                    <Input
                      id="street"
                      value={editedUser.address.street}
                      onChange={(e) => setEditedUser({
                        ...editedUser,
                        address: {...editedUser.address, street: e.target.value}
                      })}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="city" className="sm:text-right">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={editedUser.address.city}
                      onChange={(e) => setEditedUser({
                        ...editedUser,
                        address: {...editedUser.address, city: e.target.value}
                      })}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="zipcode" className="sm:text-right">
                      Zipcode
                    </Label>
                    <Input
                      id="zipcode"
                      value={editedUser.address.zipcode}
                      onChange={(e) => setEditedUser({
                        ...editedUser,
                        address: {...editedUser.address, zipcode: e.target.value}
                      })}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="sm:text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="website" className="sm:text-right">
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={editedUser.website}
                      onChange={(e) => setEditedUser({...editedUser, website: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="sm:text-right">
                      Company
                    </Label>
                    <Input
                      id="company"
                      value={editedUser.company.name}
                      onChange={(e) => setEditedUser({
                        ...editedUser,
                        company: { name: e.target.value }
                      })}
                      className="col-span-3"
                    />
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button type="button" onClick={handleSave}>
                  Сохранить изменения
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}