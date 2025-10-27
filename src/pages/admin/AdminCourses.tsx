import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Upload, FileText } from 'lucide-react';
import { useCoursesStore } from '@/stores/coursesStore';

export default function AdminCourses() {
  const { courses } = useCoursesStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = courses.filter((course) =>
    course.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الدورات</h1>
          <p className="text-muted-foreground mt-1">إدارة محتوى الدورات والمستندات</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة دورة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{courses.length}</p>
              <p className="text-sm text-muted-foreground">إجمالي الدورات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">
                {courses.filter((c) => c.publie).length}
              </p>
              <p className="text-sm text-muted-foreground">منشورة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">
                {courses.filter((c) => c.gratuit).length}
              </p>
              <p className="text-sm text-muted-foreground">مجانية</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">
                {courses.reduce((sum, c) => sum + c.etudiants, 0)}
              </p>
              <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="ابحث عن دورة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="card-feature">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{course.titre}</CardTitle>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </div>
                <img
                  src={course.thumbnail}
                  alt={course.titre}
                  className="w-24 h-24 rounded-lg object-cover mr-4"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">المستوى</p>
                    <Badge variant="outline">{course.niveau}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">السعر</p>
                    <p className="font-bold">
                      {course.gratuit ? 'مجاني' : `${course.prix} د.م`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">المدة</p>
                    <p className="font-medium">{course.duree}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الطلاب</p>
                    <p className="font-medium">{course.etudiants}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الفصول</p>
                    <p className="font-medium">{course.chapitres}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الحالة</p>
                    <Badge className={course.publie ? 'bg-success' : 'bg-muted'}>
                      {course.publie ? 'منشور' : 'مسودة'}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Eye className="w-4 h-4" />
                    عرض
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <FileText className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>المستندات والملفات</CardTitle>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              رفع ملف PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد مستندات مرفوعة بعد</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
