import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Users, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoursesStore } from '@/stores/coursesStore';

export default function Courses() {
  const { courses } = useCoursesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [niveauFilter, setNiveauFilter] = useState('all');
  const [prixFilter, setPrixFilter] = useState('all');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiveau = niveauFilter === 'all' || course.niveau === niveauFilter;
    const matchesPrix = prixFilter === 'all' || 
                       (prixFilter === 'free' && course.gratuit) ||
                       (prixFilter === 'paid' && !course.gratuit);
    return matchesSearch && matchesNiveau && matchesPrix;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero py-16 mb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white text-center mb-4">دوراتنا التعليمية</h1>
          <p className="text-white/90 text-center max-w-2xl mx-auto">
            اختر الدورة المناسبة لمستواك وابدأ رحلتك في تعلم اللغة الفرنسية
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Filters */}
        <Card className="mb-8 shadow-custom-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن دورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={niveauFilter} onValueChange={setNiveauFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="المستوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="A1">A1 - مبتدئ</SelectItem>
                  <SelectItem value="A2">A2 - ابتدائي</SelectItem>
                  <SelectItem value="B1">B1 - متوسط</SelectItem>
                  <SelectItem value="B2">B2 - متوسط متقدم</SelectItem>
                  <SelectItem value="C1">C1 - متقدم</SelectItem>
                  <SelectItem value="C2">C2 - إتقان</SelectItem>
                </SelectContent>
              </Select>
              <Select value={prixFilter} onValueChange={setPrixFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="السعر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="free">مجاني</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="card-elevated overflow-hidden">
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.titre}
                  className="w-full h-48 object-cover"
                />
                {course.gratuit && (
                  <Badge className="absolute top-4 right-4 bg-success text-white">مجاني</Badge>
                )}
                <Badge className="absolute bottom-4 right-4 bg-primary/90 text-white">
                  {course.niveau}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{course.titre}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{course.etudiants}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{course.duree}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-warning text-warning" />
                    <span>4.8</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{course.enseignant}</p>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-primary">
                    {course.gratuit ? 'مجاني' : `${course.prix} درهم`}
                  </div>
                  <Link to={`/course/${course.id}`}>
                    <Button>عرض التفاصيل</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">لم يتم العثور على دورات مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
}
