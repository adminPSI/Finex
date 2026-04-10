USE [Finex]
GO

/****** Object: Table [dbo].[COUNTY_REVENUE_DETAILS] Script Date: 1/11/2024 4:41:07 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

DROP TABLE [dbo].[COUNTY_REVENUE_DETAILS];


GO
CREATE TABLE [dbo].[COUNTY_REVENUE_DETAILS] (
    [ID]              INT            IDENTITY (1, 1) NOT NULL,
    [COUNTYREVENUEID] INT            NULL,
    [INVOICENO]       NVARCHAR (10)  NULL,
    [REV_CAC]         INT            NULL,
    [REV_IHAC]        NVARCHAR (12)  NULL,
    [REV_TYPE]        INT            NULL,
   
    [REV_SACR]        NVARCHAR (6)   NULL,
    [PAYOUTNUM]       NVARCHAR (15)  NULL,
    [NODAYTAPE]       BIT            NULL,
    [PRINTQUE]        BIT            NULL,
    [CREATEDBY]       NVARCHAR (100) NULL,
    [CREATEDDATE]     DATETIME       NULL,
    [MODIFIEDDATE]    DATETIME       NULL,
    [MODIFIEDBY]      NVARCHAR (100) NULL
);


