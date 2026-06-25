import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: router({}),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const { getSessionCookieOptions } = require("./_core/cookies");
      const { COOKIE_NAME } = require("../shared/const");
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  search: router({
    // Main search for properties
    properties: publicProcedure
      .input(z.object({
        city: z.string().min(1),
        state: z.string().min(2).max(2),
        bedrooms: z.number().optional(),
        maxRent: z.number().optional(),
        petFriendly: z.boolean().optional(),
        creditChallenges: z.array(z.string()).optional(),
        userEmail: z.string().email().optional(),
        userName: z.string().optional(),
        userPhone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const properties = await db.searchProperties({
            city: input.city,
            state: input.state,
            bedrooms: input.bedrooms,
            maxRent: input.maxRent,
            petFriendly: input.petFriendly,
          });

          // Log search for analytics
          await db.saveSearch({
            searchQuery: input,
            resultsCount: properties.length,
            creditChallenges: input.creditChallenges,
            userEmail: input.userEmail,
            userName: input.userName,
            userPhone: input.userPhone,
          });

          // Return properties WITHOUT contact info
          return {
            count: properties.length,
            properties: properties.map(p => ({
              id: p.id,
              title: p.title,
              address: p.address,
              city: p.city,
              state: p.state,
              rentPrice: p.rentPrice,
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              propertyType: p.propertyType,
              petFriendly: p.petFriendly,
              amenities: p.amenities,
              images: p.images,
              acceptsNoCredit: p.acceptsNoCredit,
              acceptsEvictions: p.acceptsEvictions,
              acceptsCriminalHistory: p.acceptsCriminalHistory,
              acceptsLowIncome: p.acceptsLowIncome,
              applicationFee: p.applicationFee,
            })),
          };
        } catch (error) {
          console.error("Search error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to search properties",
          });
        }
      }),

    // Get single property details
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          const property = await db.getPropertyById(input.id);
          if (!property) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Property not found",
            });
          }
          
          // Record view
          await db.recordPropertyView(input.id);
          
          return property;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Get property error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get property",
          });
        }
      }),
  }),

  donations: router({
    // Check if user has access
    hasAccess: publicProcedure
      .input(z.object({ userEmail: z.string().email() }))
      .query(async ({ input }) => {
        try {
          return await db.hasListAccess(input.userEmail);
        } catch (error) {
          console.error("Check access error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to check access",
          });
        }
      }),

    // Get landlord contact info (only if user has donated)
    getLandlordInfo: publicProcedure
      .input(z.object({
        propertyId: z.string(),
        userEmail: z.string().email(),
      }))
      .query(async ({ input }) => {
        try {
          // Verify user has access
          const hasAccess = await db.hasListAccess(input.userEmail);
          if (!hasAccess) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Access denied. Please complete donation first.",
            });
          }

          const property = await db.getPropertyById(input.propertyId);
          if (!property) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Property not found",
            });
          }

          return {
            landlordName: property.landlordName,
            landlordPhone: property.landlordPhone,
            landlordEmail: property.landlordEmail,
            propertyManagerName: property.propertyManagerName,
            propertyManagerPhone: property.propertyManagerPhone,
            propertyManagerEmail: property.propertyManagerEmail,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Get landlord info error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get landlord info",
          });
        }
      }),

    // Create Stripe checkout session (will be implemented with Stripe)
    createCheckoutSession: publicProcedure
      .input(z.object({
        userEmail: z.string().email(),
        userName: z.string(),
        amountDollars: z.number().min(20, "Minimum donation is $20"),
      }))
      .mutation(async ({ input }) => {
        try {
          // Placeholder - will be implemented with Stripe service
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stripe integration not yet configured",
          });
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Create checkout session error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create checkout session",
          });
        }
      }),

    // Verify donation completion
    verifyDonation: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        try {
          // Placeholder - will be implemented with Stripe service
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stripe integration not yet configured",
          });
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Verify donation error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to verify donation",
          });
        }
      }),
  }),

  admin: router({
    // Add new property (admin only)
    addProperty: protectedProcedure
      .input(z.object({
        title: z.string(),
        address: z.string(),
        city: z.string(),
        state: z.string(),
        rentPrice: z.number(),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        propertyType: z.string(),
        petFriendly: z.boolean().optional(),
        acceptsNoCredit: z.boolean().optional(),
        acceptsEvictions: z.boolean().optional(),
        acceptsCriminalHistory: z.boolean().optional(),
        acceptsLowIncome: z.boolean().optional(),
        landlordName: z.string(),
        landlordPhone: z.string(),
        landlordEmail: z.string(),
        propertyManagerName: z.string().optional(),
        propertyManagerPhone: z.string().optional(),
        propertyManagerEmail: z.string().optional(),
        applicationFee: z.number().optional(),
        leaseTerms: z.string().optional(),
        images: z.array(z.string()).optional(),
        amenities: z.array(z.string()).optional(),
        approvalNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          if (ctx.user?.role !== "admin") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Only admins can add properties",
            });
          }

          return await db.addProperty({
            ...input,
            createdByUserId: ctx.user.id,
          });
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Add property error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add property",
          });
        }
      }),

    // Get analytics (admin only)
    getAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          if (ctx.user?.role !== "admin") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Only admins can view analytics",
            });
          }

          return await db.getAnalytics();
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Get analytics error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get analytics",
          });
        }
      }),

    // Get all properties (admin only)
    getAllProperties: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          if (ctx.user?.role !== "admin") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Only admins can view all properties",
            });
          }

          return await db.getAllProperties();
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Get all properties error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get properties",
          });
        }
      }),

    // Get all donations (admin only)
    getAllDonations: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          if (ctx.user?.role !== "admin") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Only admins can view donations",
            });
          }

          return await db.getAllDonations();
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Get all donations error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get donations",
          });
        }
      }),

    // Get all searches (admin only)
    getAllSearches: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          if (ctx.user?.role !== "admin") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Only admins can view searches",
            });
          }

          return await db.getSearches();
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Get all searches error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get searches",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
