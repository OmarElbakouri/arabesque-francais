import { Link } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Blog() {
  const articles = [
    {
      id: 1,
      title: '10 نصائح لتعلم اللغة الفرنسية بسرعة',
      excerpt: 'اكتشف أفضل الطرق والتقنيات لتسريع رحلتك في تعلم اللغة الفرنسية',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
      category: 'نصائح',
      author: 'د. محمد الإدريسي',
      date: '15 ديسمبر 2024',
    },
    {
      id: 2,
      title: 'أهمية القراءة في تعلم اللغات',
      excerpt: 'كيف تساعد القراءة اليومية في تحسين مستواك اللغوي',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8',
      category: 'مهارات',
      author: 'د. محمد الإدريسي',
      date: '10 ديسمبر 2024',
    },
    {
      id: 3,
      title: 'الأخطاء الشائعة في تعلم الفرنسية',
      excerpt: 'تعرف على أكثر الأخطاء شيوعاً وكيفية تجنبها',
      image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0',
      category: 'قواعد',
      author: 'د. محمد الإدريسي',
      date: '5 ديسمبر 2024',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">المدونة</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            مقالات ونصائح لمساعدتك في رحلة تعلم اللغة الفرنسية
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Search and Filters */}
        <div className="flex gap-4 mb-8 max-w-2xl mx-auto">
          <Input placeholder="ابحث في المقالات..." className="flex-1" />
          <Button>بحث</Button>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="card-elevated overflow-hidden group">
              <div className="relative overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <Badge className="absolute top-4 right-4">{article.category}</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{article.date}</span>
                  </div>
                </div>
                <Link to={`/blog/${article.id}`}>
                  <Button variant="ghost" className="w-full">
                    اقرأ المزيد
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
