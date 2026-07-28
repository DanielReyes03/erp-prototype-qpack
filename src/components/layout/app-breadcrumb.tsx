"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { findNavItem } from "@/lib/nav-config";

export function AppBreadcrumb() {
  const pathname = usePathname();
  const found = findNavItem(pathname);
  const segments = pathname.split("/").filter(Boolean);
  const isDetail = found && segments.length > 2;

  if (!found) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Inicio</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <span className="text-muted-foreground">{found.group.title}</span>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          {isDetail ? (
            <BreadcrumbLink render={<Link href={found.item.href} />}>{found.item.title}</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{found.item.title}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {isDetail && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Detalle</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
