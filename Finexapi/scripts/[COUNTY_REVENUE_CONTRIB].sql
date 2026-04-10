USE [Finex]
GO

/****** Object: Table [dbo].[COUNTY_REVENUE_CONTRIB] Script Date: 1/9/2024 5:11:45 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[COUNTY_REVENUE_CONTRIB] (
    [ID]              INT            IDENTITY (1, 1) NOT NULL,
    [REVENUE_CONTIB]  NVARCHAR (35)  NULL,
    [ADDRESS]         NVARCHAR (75)  NULL,
    [CITY]            NVARCHAR (50)  NULL,
    [STATE]           NVARCHAR (2)   NULL,
    [ZIP]             NVARCHAR (10)  NULL,
    [PHONE]           NVARCHAR (10)  NULL,
    [ATTENTO]         NVARCHAR (75)  NULL,
    [INACTIVE]        BIT            NULL,
    [VENDORNO]        NVARCHAR (15)  NULL,
    [ADDRESSLINE2]    NVARCHAR (75)  NULL,
    [CLIENTID]        INT            NULL,
    [PAYEEADDRESS]    BIT            NULL,
    [CONSUMERADDRESS] BIT            NULL,
    [EMAIL]           NVARCHAR (100) NULL,
    [EMAIL2]          NVARCHAR (50)  NULL,
    [PHONENUMBER]     NVARCHAR (10)  NULL,
    [CREATEDBY]       NVARCHAR (300) NULL,
    [CREATEDDATE]     DATETIME       NULL,
    [MODIFIEDBY]      NVARCHAR (300) NULL,
    [MODIFIEDDATE]    DATETIME       NULL
);


