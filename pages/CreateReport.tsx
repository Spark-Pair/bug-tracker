import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/auth';
import { Card, Input, Button } from '../components/UIComponents';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { ReportSeverity } from '../types';

export const CreateReport: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    app: '',
    page: '',
    url: '',
    description: '',
    severity: 'low' as ReportSeverity
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Compress and convert all files to Base64
      const base64Screenshots = await Promise.all(
        selectedFiles.map(file => compressAndConvert(file))
      );

      await api.createReport({
        ...formData,
        reporterId: user!.id,
        reporterName: user!.username,
        screenshots: base64Screenshots
      });
      navigate('/reports');
    } catch (error) {
      console.error(error);
      alert('Failed to create report. Please try with fewer or smaller images.');
    } finally {
      setLoading(false);
    }
  };

  const compressAndConvert = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Max dimensions
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.7 quality
          resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      setSelectedFiles(prev => [...prev, ...filesArray]);
      
      // Create previews
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Report a Bug</h1>
        <p className="text-slate-500 font-light mt-2">Help us improve by providing detailed information about the issue.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Application Name" 
              placeholder="e.g. Marketing Site" 
              required
              value={formData.app}
              onChange={e => setFormData({...formData, app: e.target.value})}
            />
            <Input 
              label="Page / Feature" 
              placeholder="e.g. Checkout" 
              required
              value={formData.page}
              onChange={e => setFormData({...formData, page: e.target.value})}
            />
          </div>

          <Input 
            label="URL (Optional)" 
            type="url"
            placeholder="https://example.com/bug" 
            value={formData.url}
            onChange={e => setFormData({...formData, url: e.target.value})}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">Description</label>
            <textarea 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all h-40 resize-none placeholder:text-slate-400"
              placeholder="Describe what happened, steps to reproduce, and expected behavior..."
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">Severity</label>
              <div className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                {(['low', 'medium', 'high'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFormData({...formData, severity: sev})}
                    className={`
                      flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all
                      ${formData.severity === sev 
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }
                    `}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">Screenshots</label>
              
              {/* Preview Grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {previews.map((src, index) => (
                    <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <input 
                  type="file" 
                  id="screenshot" 
                  className="hidden" 
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="screenshot"
                  className="flex items-center justify-center gap-3 w-full py-8 px-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-3xl cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-slate-500 dark:text-slate-400 group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
                       <UploadCloud className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">Click to upload images</span>
                    <span className="text-xs text-slate-400">Supports JPG, PNG (Auto-compressed)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button type="submit" isLoading={loading} className="px-8">
              Submit Report
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};