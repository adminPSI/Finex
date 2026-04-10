USE [Finex]
GO

/****** Object: Table [dbo].[ACCOUNTRECEIVABLES] Script Date: 1/11/2024 4:50:26 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

DROP TABLE [dbo].[ACCOUNTRECEIVABLES];


GO
CREATE TABLE [dbo].[ACCOUNTRECEIVABLES] (
    [ID]              INT            IDENTITY (1, 1) NOT NULL,
    [VENDORID]        INT            NULL,
    [ARDATE]          DATETIME       NULL,
    [INVOICENO]       NVARCHAR (8)   NULL,
    [AMOUNT]          MONEY          NULL,
    [BALANCE]         MONEY          NULL,
    [UNCOLLECTEDDEBT] BIT            NULL,
	 [CORRECTED]         BIT            NULL,
    [PRINTED]         BIT            NULL,
    [CREATEDBY]       NVARCHAR (300) NULL,
    [CREATEDDATE]     DATETIME       NULL,
    [MODIFIEDBY]      NVARCHAR (300) NULL,
    [MODIFIEDDATE]    DATETIME       NULL
);


