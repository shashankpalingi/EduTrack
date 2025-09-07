import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMaterials, recordMaterialView } from '../../lib/supabaseDatabase';
import { getPublicUrl } from '../../lib/supabaseStorage';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { FileText, Download, Calendar, User } from 'lucide-react';

interface Material {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  teacher_id: string;
  created_at?: string;
  teacher_name?: string;
}

const MaterialBrowser = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const result = await getMaterials();
      if (result.error) {
        throw result.error;
      }
      setMaterials(result.data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.error('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMaterial = async (material: Material) => {
    if (!user?.id) {
      toast.error('You must be logged in to view materials');
      return;
    }

    if (!material.file_url) {
      toast.error('This material has no file attached');
      return;
    }

    try {
      // Record the view in the database
      await recordMaterialView(material.id, user.id);
      
      // Open the file in a new tab
      window.open(material.file_url, '_blank');
    } catch (error) {
      console.error('Error viewing material:', error);
      toast.error('Failed to open material');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  const getFileTypeIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="h-5 w-5" />;
    
    if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return <FileText className="h-5 w-5 text-orange-500" />;
    } else {
      return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Study Materials</h2>
      
      {loading && <p className="text-center py-4">Loading materials...</p>}
      
      {!loading && materials.length === 0 && (
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-gray-500">No study materials available yet.</p>
        </div>
      )}
      
      {!loading && materials.length > 0 && (
        <div className="space-y-4">
          {materials.map((material) => (
            <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded">
                    {getFileTypeIcon(material.file_type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{material.title}</h3>
                    {material.description && (
                      <p className="text-gray-600 mt-1">{material.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(material.created_at)}
                      </div>
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {material.teacher_name || 'Teacher'}
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleViewMaterial(material)}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialBrowser;