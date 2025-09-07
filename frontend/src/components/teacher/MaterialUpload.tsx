import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadMaterial } from '../../lib/supabaseStorage';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const MaterialUpload = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('You must be logged in to upload materials');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadMaterial(
        user.id,
        file,
        title,
        description
      );

      if (result.error) {
        throw result.error;
      }

      toast.success('Material uploaded successfully');
      
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to upload material. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Upload Study Material</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter material title"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter material description"
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="file-upload">File</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            required
          />
          {file && (
            <p className="text-sm text-gray-500">
              Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload Material'}
        </Button>
      </form>
    </div>
  );
};

export default MaterialUpload;