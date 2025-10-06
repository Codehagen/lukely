import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { siteConfig } from "@/lib/config";
import { truncate } from "@/lib/constructMetadata";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function getDoorShareData(slug: string, doorNumber: number) {
  return prisma.door.findFirst({
    where: {
      doorNumber,
      calendar: {
        slug,
      },
    },
    include: {
      product: true,
      calendar: {
        select: {
          title: true,
          brandColor: true,
          workspace: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: { slug: string; doorNumber: string };
  },
) {
  const parsedDoorNumber = Number(params.doorNumber);

  if (!Number.isFinite(parsedDoorNumber)) {
    return createFallbackResponse("Ugyldig luke");
  }

  const door = await getDoorShareData(params.slug, parsedDoorNumber);

  if (!door || !door.calendar) {
    return createFallbackResponse("Luke ikke funnet");
  }

  const brandColor = door.calendar.brandColor || "#111827";
  const productName = door.product?.name ?? door.title ?? `Luke ${door.doorNumber}`;
  const organizerName = door.calendar.workspace?.name ?? door.calendar.title ?? siteConfig.name;
  const description = truncate(
    door.product?.description ?? door.description ?? siteConfig.description,
    120,
  ) ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          color: "#0f172a",
          background: `linear-gradient(135deg, ${hexWithAlpha(brandColor, 0.18)} 0%, #f8fafc 100%)`,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                fontSize: "64px",
                fontWeight: 700,
                marginBottom: "16px",
                color: brandColor,
              }}
            >
              {productName}
            </div>
            <div
              style={{
                fontSize: "28px",
                lineHeight: 1.4,
                maxWidth: "800px",
              }}
            >
              {description}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              {organizerName}
            </div>
            <div
              style={{
                padding: "8px 16px",
                borderRadius: "9999px",
                background: brandColor,
                color: "#fff",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              Luke {door.doorNumber}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "24px",
            color: "#475569",
            borderTop: "1px solid rgba(15, 23, 42, 0.08)",
            paddingTop: "32px",
          }}
        >
          <div style={{ fontWeight: 600 }}>{siteConfig.name}</div>
          <div style={{ fontSize: "22px" }}>Del kampanjen - {new Date().getFullYear()}</div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

function createFallbackResponse(message: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "48px",
          fontFamily: "Inter, sans-serif",
          color: "#0f172a",
          background: "linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)",
        }}
      >
        {message}
      </div>
    ),
    {
      ...size,
    },
  );
}

function hexWithAlpha(hex: string, alpha: number) {
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) {
    return `rgba(15, 23, 42, ${alpha})`;
  }
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
