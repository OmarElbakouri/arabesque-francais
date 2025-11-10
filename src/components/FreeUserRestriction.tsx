import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FreeUserRestrictionProps {
  featureName: string;
}

export const FreeUserRestriction = ({ featureName }: FreeUserRestrictionProps) => {
  return (
    <Card className="border-2 border-warning/50 bg-warning/5">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-warning" />
          <CardTitle className="text-warning">محتوى محظور</CardTitle>
        </div>
        <CardDescription>
          {featureName} متاح فقط للمشتركين
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          أنت حالياً مستخدم تجريبي (FREE) ولديك وصول محدود. قم بالترقية للوصول الكامل لجميع المحتويات والميزات.
        </p>
        
        <div className="space-y-3">
          <div className="bg-background rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">الترقية إلى مستخدم عادي (NORMAL)</h4>
            <ul className="text-sm space-y-1 mb-3">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                الوصول لجميع دروس المستوى الحالي
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                30 نقطة ذكاء اصطناعي شهرياً
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                دعم المدرب عبر الإيميل
              </li>
            </ul>
            <Button className="w-full" asChild>
              <Link to="/upgrade?plan=normal">
                الترقية إلى NORMAL
              </Link>
            </Button>
          </div>

          <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg p-4 border-2 border-secondary/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-secondary text-white text-xs px-2 py-1 rounded font-bold">الأفضل</span>
              <h4 className="font-semibold">الترقية إلى VIP</h4>
            </div>
            <ul className="text-sm space-y-1 mb-3">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-secondary" />
                الوصول لجميع المستويات والدروس
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-secondary" />
                نقاط ذكاء اصطناعي غير محدودة
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-secondary" />
                جلسات فردية مع المدرب
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-secondary" />
                شهادة معتمدة
              </li>
            </ul>
            <Button className="w-full bg-secondary hover:bg-secondary/90" asChild>
              <Link to="/upgrade?plan=vip">
                الترقية إلى VIP
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
