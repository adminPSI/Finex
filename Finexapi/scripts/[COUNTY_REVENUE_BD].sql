USE [Finex]
GO

/****** Object: Table [dbo].[COUNTY_REVENUE_BD] Script Date: 1/9/2024 5:11:26 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[COUNTY_REVENUE_BD] (
    [ID]                 INT            IDENTITY (1, 1) NOT NULL,
    [REV_BD_AMOUNT]      MONEY          NULL,
    [REV_BD_CHECK_NO]    NVARCHAR (25)  NULL,
    [REV_BD_CAC]         INT            NULL,
    [REV_BD_IHAC]        NVARCHAR (12)  NULL,
    [REV_BD_TYPE]        INT            NULL,
    [REV_BD_SACR]        NVARCHAR (6)   NULL,
    [REV_ID]             INT            NULL,
    [REV_DATE]           DATETIME       NULL,
    [BDDESCRIPTION]      NVARCHAR (255) NULL,
    [INVOICENO]          NVARCHAR (15)  NULL,
    [CERTLICENSENO]      NVARCHAR (100) NULL,
    [RECIEPTLINEID]      INT            NULL,
    [CUSTOMERID]         INT            NULL,
    [INVOICELINEID]      INT            NULL,
    [PAYIN]              NVARCHAR (25)  NULL,
    [PROJECTID]          INT            NULL,
    [OTHERDESCRIPTIONID] INT            NULL,
    [CREATEDBY]          NVARCHAR (300) NULL,
    [CREATEDDATE]        DATETIME       NULL,
    [MODIFIEDBY]         NVARCHAR (300) NULL,
    [MODIFIEDDATE]       DATETIME       NULL
);


