import { AdminSidebar } from "@/Components/admin-sidebar";
import { Head } from '@inertiajs/react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/Components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function Reports() {
  return (
    <SidebarProvider>
      <Head title="Reports" />
      <AdminSidebar />
      <SidebarInset>
        <header
          className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <a 
                    href={route('admin.dashboard')} 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Admin Dashboard
                  </a>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <span className="mx-2 text-gray-400">›</span>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>Reports</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-purple-50 to-slate-50">
          <Card>
            <CardHeader>
              <CardTitle>Reports Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reports management page</p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
