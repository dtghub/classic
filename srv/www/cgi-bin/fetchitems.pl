#!/usr/bin/perl -w
use strict;
use warnings;

use CGI;
use DBI;
use JSON;
use Data::Dumper qw(Dumper);
#use DBI qw(:sql_types);

my $q = new CGI;
print $q->header();



my $dbh = DBI->connect('dbi:Pg:dbname=classic;host=localhost','derek','dtDerek',{AutoCommit=>1,RaiseError=>1,PrintError=>0});

my $sth = $dbh->prepare("SELECT * FROM items WHERE 1=0");
$sth->execute();
my $fields = $sth->{NAME};



print "{\n\"items\" : [\n";

my %hash;
my $json;
my $useacomma;

$useacomma = 0;

my $sth = $dbh->prepare("SELECT * FROM items");
$sth->execute();

while (my @row = $sth->fetchrow_array) {  # retrieve one row

@hash{@$fields} = @row;
$json = encode_json \%hash;
if ($useacomma) {
  print ",\n";
} else {
  $useacomma = 1;
};

print $json;
}

print "\n]\n}\n\n";
