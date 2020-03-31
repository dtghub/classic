#!/usr/bin/perl -w
use strict;
use warnings;

use CGI;
use DBI;
use JSON;
use Data::Dumper qw(Dumper);

my $q = new CGI;
print $q->header();



my $dbh = DBI->connect('dbi:Pg:dbname=classic;host=localhost','derek','dtDerek',{AutoCommit=>1,RaiseError=>1,PrintError=>0});



my $sth = $dbh->prepare("SELECT command, token FROM commands") or die +DBI->errstr;
$sth->execute() or die DBI->errstr;
my %hash;
while( my( $command, $token ) = $sth->fetchrow_array() ) {
    $hash{ $command } = $token;
}




my $json = encode_json \%hash;

print $json,"\n\n";
