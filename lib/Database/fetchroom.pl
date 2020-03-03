#! /usr/bin/perl
use strict;
use DBI;

my $dbHandle = DBI->connect('dbi:Pg:dbname=classic;host=localhost','derek','dtDerek',{AutoCommit=>1,RaiseError=>1,PrintError=>0});

print "2+2=",$dbHandle->selectrow_array("SELECT 2+2"),"\n";
