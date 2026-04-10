
GO


SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO
drop TABLE [dbo].[COUNTY_REVENUE_BD]
CREATE TABLE [dbo].[COUNTY_REVENUE_BD] (
    [ID]                 INT            IDENTITY (1, 1) NOT NULL,
    [REV_BD_AMOUNT]      MONEY          NULL,
    [REV_BD_CHECK NO]    NVARCHAR (25)  NULL,
    [REV_BD_CAC]         INT            NULL,
    [REV_BD_IHAC]        NVARCHAR (12)  NULL,
    [REV_BD_TYPE]        INT            NULL,
    [REV_BD_SACR]        NVARCHAR (6)   NULL,
    [REV_ID]             INT            NULL,
    [REV_DATE]           DATETIME       NULL,
    [BDDESCRIPTION]      NVARCHAR (255) NULL,
    [INVOICENO]          NVARCHAR (15)  NULL,
    [CERTLICENSENO]      NVARCHAR (100) NULL,
    [RECIEPTLINEID]      INT            NOT NULL,
    [CUSTOMERID]         INT            NOT NULL,
    [INVOICELINEID]      INT            NOT NULL,
    [PAYIN]              NVARCHAR (25)  NULL,
    [PROJECTID]          INT            NOT NULL,
    [OTHERDESCRIPTIONID] INT            NOT NULL,
    [MODIFIEDWHEN]       DATETIME       NULL,
    [MODIFIEDBY]         INT            NOT NULL
);




